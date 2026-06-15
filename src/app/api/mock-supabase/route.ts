import { NextRequest, NextResponse } from "next/server";
import { getDb, saveDb } from "@/lib/supabase/mockDb";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, table, payload } = body;

    const db = getDb();
    const sessionVal = req.cookies.get("sb-mock-session")?.value;

    // Helper to get current user based on cookie
    const getCurrentUser = () => {
      if (!sessionVal) return null;
      // Find profile corresponding to sessionVal
      const profile = db.profiles.find((p) => p.id === sessionVal);
      if (profile) {
        return {
          id: profile.id,
          email: profile.email,
          user_metadata: {
            full_name: profile.full_name,
            organization: profile.organization,
          },
        };
      }
      // Default mock user if not found in profiles but has a session cookie
      return {
        id: sessionVal,
        email: "sneha.gk@example.com",
        user_metadata: {
          full_name: "Sneha GK",
          organization: "DeciTrace Admin",
        },
      };
    };

    // 1. AUTH ACTIONS
    if (action === "getUser") {
      const user = getCurrentUser();
      return NextResponse.json({ data: { user }, error: null });
    }

    if (action === "signUp") {
      const { email, password, options } = payload;
      
      // Check if user already exists
      const existing = db.profiles.find((p) => p.email.toLowerCase() === email.toLowerCase());
      if (existing) {
        return NextResponse.json({ data: { user: null, session: null }, error: { message: "User already registered" } }, { status: 400 });
      }

      const newUserId = "user_" + Math.random().toString(36).substr(2, 9);
      const newProfile = {
        id: newUserId,
        email,
        full_name: options?.data?.full_name || email.split("@")[0],
        organization: options?.data?.organization || "Personal",
        role: "auditor",
        created_at: new Date().toISOString(),
      };

      db.profiles.push(newProfile);
      
      // Update decisions/events user_id to match this new user if they were set to default 'mock-user-id'
      db.decisions.forEach((d) => {
        if (d.user_id === "mock-user-id") d.user_id = newUserId;
      });
      db.decision_events.forEach((e) => {
        if (e.actor_id === "mock-user-id") e.actor_id = newUserId;
      });

      saveDb(db);

      const user = {
        id: newUserId,
        email,
        user_metadata: {
          full_name: newProfile.full_name,
          organization: newProfile.organization,
        },
      };

      const res = NextResponse.json({
        data: {
          user,
          session: { access_token: "mock-jwt-token", expires_in: 3600, user },
        },
        error: null,
      });

      res.cookies.set("sb-mock-session", newUserId, {
        path: "/",
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 7, // 1 week
      });

      return res;
    }

    if (action === "signIn") {
      const { email, password } = payload;
      let profile = db.profiles.find((p) => p.email.toLowerCase() === email.toLowerCase());

      // For mock mode, auto-create the profile if it doesn't exist, to make it extremely easy to log in
      if (!profile) {
        const newUserId = "user_" + Math.random().toString(36).substr(2, 9);
        profile = {
          id: newUserId,
          email,
          full_name: email.split("@")[0],
          organization: "Personal",
          role: "auditor",
          created_at: new Date().toISOString(),
        };
        db.profiles.push(profile);
        
        // Update decisions/events user_id to match this new user if they were set to default 'mock-user-id'
        db.decisions.forEach((d) => {
          if (d.user_id === "mock-user-id") d.user_id = newUserId;
        });
        db.decision_events.forEach((e) => {
          if (e.actor_id === "mock-user-id") e.actor_id = newUserId;
        });
        
        saveDb(db);
      }

      const user = {
        id: profile.id,
        email,
        user_metadata: {
          full_name: profile.full_name,
          organization: profile.organization,
        },
      };

      const res = NextResponse.json({
        data: {
          user,
          session: { access_token: "mock-jwt-token", expires_in: 3600, user },
        },
        error: null,
      });

      res.cookies.set("sb-mock-session", profile.id, {
        path: "/",
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 7, // 1 week
      });

      return res;
    }

    if (action === "signOut") {
      const res = NextResponse.json({ error: null });
      res.cookies.set("sb-mock-session", "", { path: "/", maxAge: -1 });
      return res;
    }

    // 2. DATABASE ACTIONS
    const currentUser = getCurrentUser();
    const currentUserId = currentUser?.id || "mock-user-id";

    if (action === "dbSelect") {
      let rows = table === "decisions" ? db.decisions : table === "decision_events" ? db.decision_events : db.profiles;

      // Filter rows to only return those belonging to the current user (RLS simulation)
      if (table === "decisions") {
        rows = rows.filter((r) => r.user_id === currentUserId);
      } else if (table === "decision_events") {
        // Find decisions belonging to current user first
        const userDecisionIds = db.decisions.filter((d) => d.user_id === currentUserId).map((d) => d.id);
        rows = rows.filter((r) => userDecisionIds.includes(r.decision_id));
      } else if (table === "profiles") {
        rows = rows.filter((r) => r.id === currentUserId);
      }

      // Apply where filters
      const { filters, ordering, limitCount, rangeStart, rangeEnd, returnCount } = payload;
      
      if (filters && Array.isArray(filters)) {
        filters.forEach((f: any) => {
          const { col, op, val } = f;
          if (op === "eq") {
            rows = rows.filter((r) => r[col] === val);
          } else if (op === "gte") {
            rows = rows.filter((r) => r[col] >= val);
          } else if (op === "notNull") {
            rows = rows.filter((r) => r[col] !== null && r[col] !== undefined);
          } else if (op === "or") {
            // e.g. decision_type.ilike.%q%,model_name.ilike.%q%...
            const orParts = val.split(",");
            rows = rows.filter((r) => {
              return orParts.some((part: string) => {
                const [column, rawSearch] = part.split(".ilike.");
                if (!rawSearch) return false;
                const searchStr = rawSearch.replace(/%/g, "").toLowerCase();
                const cellVal = String(r[column] || "").toLowerCase();
                return cellVal.includes(searchStr);
              });
            });
          }
        });
      }

      // Apply ordering
      if (ordering && Array.isArray(ordering)) {
        ordering.forEach((o: any) => {
          const { column, ascending } = o;
          rows = [...rows].sort((a, b) => {
            const valA = a[column];
            const valB = b[column];
            if (valA === valB) return 0;
            if (valA === null || valA === undefined) return 1;
            if (valB === null || valB === undefined) return -1;
            return ascending ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
          });
        });
      }

      const totalCount = rows.length;

      // Apply range slice
      if (typeof rangeStart === "number" && typeof rangeEnd === "number") {
        rows = rows.slice(rangeStart, rangeEnd + 1);
      }

      // Apply limit
      if (typeof limitCount === "number") {
        rows = rows.slice(0, limitCount);
      }

      return NextResponse.json({
        data: rows,
        count: returnCount ? totalCount : null,
        error: null,
      });
    }

    if (action === "dbInsert") {
      const rowsToInsert = Array.isArray(payload.rows) ? payload.rows : [payload.rows];
      const inserted: any[] = [];

      rowsToInsert.forEach((row: any) => {
        const id = row.id || "rec_" + Math.random().toString(36).substr(2, 9);
        const newRow = {
          ...row,
          id,
          user_id: table === "decisions" ? currentUserId : row.user_id || currentUserId,
          created_at: row.created_at || new Date().toISOString(),
        };

        if (table === "decisions") {
          db.decisions.push(newRow);
          // Simulate database triggers: insert creation event
          const eventId = "ev_" + Math.random().toString(36).substr(2, 9);
          db.decision_events.push({
            id: eventId,
            decision_id: id,
            actor_id: currentUserId,
            action: "decision.created",
            details: {
              outcome: newRow.outcome,
              risk_level: newRow.risk_level,
              model_name: newRow.model_name,
              model_version: newRow.model_version,
            },
            created_at: new Date().toISOString(),
          });
        } else if (table === "decision_events") {
          db.decision_events.push({
            ...newRow,
            actor_id: currentUserId,
          });
        } else if (table === "profiles") {
          db.profiles.push(newRow);
        }

        inserted.push(newRow);
      });

      saveDb(db);
      return NextResponse.json({ data: inserted, error: null });
    }

    if (action === "dbUpdate") {
      const { matchCol, matchVal, values } = payload;
      let count = 0;
      const updatedRows: any[] = [];

      if (table === "decisions") {
        db.decisions = db.decisions.map((d) => {
          if (d[matchCol] === matchVal && d.user_id === currentUserId) {
            count++;
            
            // Build audit trigger details
            const changes: any = {};
            if (values.outcome && values.outcome !== d.outcome) {
              changes.outcome = { from: d.outcome, to: values.outcome };
            }
            if (values.risk_level && values.risk_level !== d.risk_level) {
              changes.risk_level = { from: d.risk_level, to: values.risk_level };
            }
            if (values.reviewer_notes && values.reviewer_notes !== d.reviewer_notes) {
              changes.reviewer_notes_changed = true;
            }

            const updated = {
              ...d,
              ...values,
              reviewed_by: values.reviewed_by || (values.outcome ? currentUserId : d.reviewed_by),
              reviewed_at: values.reviewed_at || (values.outcome ? new Date().toISOString() : d.reviewed_at),
            };

            // Trigger append event
            if (Object.keys(changes).length > 0) {
              db.decision_events.push({
                id: "ev_" + Math.random().toString(36).substr(2, 9),
                decision_id: d.id,
                actor_id: currentUserId,
                action: "decision.updated",
                details: changes,
                created_at: new Date().toISOString(),
              });
            }

            updatedRows.push(updated);
            return updated;
          }
          return d;
        });
      } else if (table === "profiles") {
        db.profiles = db.profiles.map((p) => {
          if (p[matchCol] === matchVal && p.id === currentUserId) {
            count++;
            const updated = { ...p, ...values };
            updatedRows.push(updated);
            return updated;
          }
          return p;
        });
      }

      saveDb(db);
      return NextResponse.json({ data: updatedRows, error: null });
    }

    if (action === "dbUpsert") {
      const row = payload.row;
      let updated = false;

      if (table === "profiles") {
        db.profiles = db.profiles.map((p) => {
          if (p.id === row.id) {
            updated = true;
            return { ...p, ...row };
          }
          return p;
        });
        if (!updated) {
          db.profiles.push({
            ...row,
            role: row.role || "auditor",
            created_at: row.created_at || new Date().toISOString(),
          });
        }
      }

      saveDb(db);
      return NextResponse.json({ data: [row], error: null });
    }

    return NextResponse.json({ error: { message: "Invalid action" } }, { status: 400 });
  } catch (error: any) {
    console.error("Mock API error:", error);
    return NextResponse.json({ error: { message: error.message || "Internal server error" } }, { status: 500 });
  }
}
