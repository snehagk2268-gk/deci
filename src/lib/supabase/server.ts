import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getDb, saveDb } from "@/lib/supabase/mockDb";

const isMockMode =
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes("lmasoabgzlsvxavihnqw");

// Synchronous server-side Mock Query Builder to avoid HTTP fetch overhead
class ServerMockQueryBuilder {
  table: string;
  filters: any[] = [];
  ordering: any[] = [];
  limitCount: number | null = null;
  rangeStart: number | null = null;
  rangeEnd: number | null = null;
  returnCount: boolean = false;
  userId: string;

  constructor(table: string, userId: string) {
    this.table = table;
    this.userId = userId;
  }

  select(columns = "*", options?: { count?: string; head?: boolean }) {
    if (options?.count) this.returnCount = true;
    if (options?.head) this.limitCount = 0;
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.ordering.push({ column, ascending: options?.ascending ?? true });
    return this;
  }

  limit(n: number) {
    this.limitCount = n;
    return this;
  }

  range(start: number, end: number) {
    this.rangeStart = start;
    this.rangeEnd = end;
    return this;
  }

  eq(col: string, val: any) {
    this.filters.push({ col, op: "eq", val });
    return this;
  }

  gte(col: string, val: any) {
    this.filters.push({ col, op: "gte", val });
    return this;
  }

  not(col: string, op: string, val: any) {
    if (op === "is" && val === null) {
      this.filters.push({ col, op: "notNull", val: null });
    }
    return this;
  }

  or(val: string) {
    this.filters.push({ col: "", op: "or", val });
    return this;
  }

  maybeSingle() {
    return this.then().then(({ data, error }: any) => ({
      data: data && data.length ? data[0] : null,
      error,
    }));
  }

  single() {
    return this.then().then(({ data, error }: any) => {
      if (!data || !data.length) {
        return { data: null, error: { message: "No row found" } };
      }
      return { data: data[0], error };
    });
  }

  async then(onfulfilled?: (value: any) => any) {
    try {
      const db = getDb();
      let rows =
        this.table === "decisions"
          ? db.decisions
          : this.table === "decision_events"
          ? db.decision_events
          : db.profiles;

      // Filter rows belonging to the current user (RLS)
      if (this.table === "decisions") {
        rows = rows.filter((r) => r.user_id === this.userId);
      } else if (this.table === "decision_events") {
        const userDecisionIds = db.decisions
          .filter((d) => d.user_id === this.userId)
          .map((d) => d.id);
        rows = rows.filter((r) => userDecisionIds.includes(r.decision_id));
      } else if (this.table === "profiles") {
        rows = rows.filter((r) => r.id === this.userId);
      }

      // Apply where filters
      this.filters.forEach((f: any) => {
        const { col, op, val } = f;
        if (op === "eq") {
          rows = rows.filter((r) => r[col] === val);
        } else if (op === "gte") {
          rows = rows.filter((r) => r[col] >= val);
        } else if (op === "notNull") {
          rows = rows.filter((r) => r[col] !== null && r[col] !== undefined);
        } else if (op === "or") {
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

      // Apply ordering
      this.ordering.forEach((o: any) => {
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

      const totalCount = rows.length;

      // Apply range slice
      if (typeof this.rangeStart === "number" && typeof this.rangeEnd === "number") {
        rows = rows.slice(this.rangeStart, this.rangeEnd + 1);
      }

      // Apply limit
      if (typeof this.limitCount === "number") {
        rows = rows.slice(0, this.limitCount);
      }

      const res = {
        data: rows,
        count: this.returnCount ? totalCount : null,
        error: null,
      };

      if (onfulfilled) return onfulfilled(res);
      return res;
    } catch (e: any) {
      const err = { data: null, error: { message: e.message } };
      if (onfulfilled) return onfulfilled(err);
      return err;
    }
  }
}

class ServerMockDbMutator {
  table: string;
  userId: string;

  constructor(table: string, userId: string) {
    this.table = table;
    this.userId = userId;
  }

  insert(rows: any) {
    return {
      select: () => ({
        single: async () => {
          const db = getDb();
          const rowsToInsert = Array.isArray(rows) ? rows : [rows];
          const inserted: any[] = [];

          rowsToInsert.forEach((row: any) => {
            const id = row.id || "rec_" + Math.random().toString(36).substr(2, 9);
            const newRow = {
              ...row,
              id,
              user_id: this.userId,
              created_at: row.created_at || new Date().toISOString(),
            };

            if (this.table === "decisions") {
              db.decisions.push(newRow);
              db.decision_events.push({
                id: "ev_" + Math.random().toString(36).substr(2, 9),
                decision_id: id,
                actor_id: this.userId,
                action: "decision.created",
                details: {
                  outcome: newRow.outcome,
                  risk_level: newRow.risk_level,
                  model_name: newRow.model_name,
                  model_version: newRow.model_version,
                },
                created_at: new Date().toISOString(),
              });
            } else if (this.table === "decision_events") {
              db.decision_events.push({ ...newRow, actor_id: this.userId });
            }
            inserted.push(newRow);
          });

          saveDb(db);
          return { data: inserted[0], error: null };
        },
      }),
      then: async (onfulfilled?: (value: any) => any) => {
        const db = getDb();
        const rowsToInsert = Array.isArray(rows) ? rows : [rows];
        const inserted: any[] = [];

        rowsToInsert.forEach((row: any) => {
          const id = row.id || "rec_" + Math.random().toString(36).substr(2, 9);
          const newRow = {
            ...row,
            id,
            user_id: this.userId,
            created_at: row.created_at || new Date().toISOString(),
          };

          if (this.table === "decisions") {
            db.decisions.push(newRow);
          } else if (this.table === "decision_events") {
            db.decision_events.push({ ...newRow, actor_id: this.userId });
          }
          inserted.push(newRow);
        });

        saveDb(db);
        const res = { data: inserted, error: null };
        if (onfulfilled) return onfulfilled(res);
        return res;
      },
    };
  }

  update(values: any) {
    return {
      eq: (matchCol: string, matchVal: any) => {
        return {
          then: async (onfulfilled?: (value: any) => any) => {
            const db = getDb();
            const updatedRows: any[] = [];

            if (this.table === "decisions") {
              db.decisions = db.decisions.map((d) => {
                if (d[matchCol] === matchVal && d.user_id === this.userId) {
                  const updated = {
                    ...d,
                    ...values,
                    reviewed_by: this.userId,
                    reviewed_at: new Date().toISOString(),
                  };
                  updatedRows.push(updated);
                  return updated;
                }
                return d;
              });
            }
            saveDb(db);
            const res = { data: updatedRows, error: null };
            if (onfulfilled) return onfulfilled(res);
            return res;
          },
        };
      },
    };
  }

  upsert(row: any) {
    return {
      then: async (onfulfilled?: (value: any) => any) => {
        const db = getDb();
        let updated = false;

        if (this.table === "profiles") {
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
        const res = { data: [row], error: null };
        if (onfulfilled) return onfulfilled(res);
        return res;
      },
    };
  }
}

export function createClient() {
  const cookieStore = cookies();

  if (isMockMode) {
    const sessionVal = cookieStore.get("sb-mock-session")?.value;
    const currentUserId = sessionVal || "mock-user-id";

    const mockAuth = {
      getUser: async () => {
        if (!sessionVal) {
          return { data: { user: null }, error: null };
        }
        const db = getDb();
        const profile = db.profiles.find((p) => p.id === sessionVal);
        const user = {
          id: sessionVal,
          email: profile?.email || "sneha.gk@example.com",
          user_metadata: {
            full_name: profile?.full_name || "Sneha GK",
            organization: profile?.organization || "DeciTrace Admin",
          },
        };
        return { data: { user }, error: null };
      },
      signOut: async () => {
        return { error: null };
      },
    };

    return new Proxy({} as any, {
      get(target, prop) {
        if (prop === "auth") return mockAuth;
        if (prop === "from") {
          return (table: string) => {
            const queryBuilder = new ServerMockQueryBuilder(table, currentUserId);
            const mutator = new ServerMockDbMutator(table, currentUserId);
            
            return new Proxy({} as any, {
              get(t, method) {
                if (method === "insert" || method === "update" || method === "upsert") {
                  return (mutator as any)[method].bind(mutator);
                }
                return (queryBuilder as any)[method].bind(queryBuilder);
              }
            });
          };
        }
        return null;
      }
    });
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: any) {
          try {
            cookiesToSet.forEach(({ name, value, options }: { name: string; value: string; options: any }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}
