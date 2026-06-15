import { createBrowserClient } from "@supabase/ssr";

const isMockMode =
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes("lmasoabgzlsvxavihnqw");

class MockQueryBuilder {
  table: string;
  filters: any[] = [];
  ordering: any[] = [];
  limitCount: number | null = null;
  rangeStart: number | null = null;
  rangeEnd: number | null = null;
  returnCount: boolean = false;

  constructor(table: string) {
    this.table = table;
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
      const res = await fetch("/api/mock-supabase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "dbSelect",
          table: this.table,
          payload: {
            filters: this.filters,
            ordering: this.ordering,
            limitCount: this.limitCount,
            rangeStart: this.rangeStart,
            rangeEnd: this.rangeEnd,
            returnCount: this.returnCount,
          },
        }),
      });
      const data = await res.json();
      if (onfulfilled) return onfulfilled(data);
      return data;
    } catch (e: any) {
      const err = { data: null, error: { message: e.message } };
      if (onfulfilled) return onfulfilled(err);
      return err;
    }
  }
}

class MockDbMutator {
  table: string;

  constructor(table: string) {
    this.table = table;
  }

  insert(rows: any) {
    return {
      select: () => ({
        single: () => {
          return fetch("/api/mock-supabase", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "dbInsert",
              table: this.table,
              payload: { rows },
            }),
          })
            .then((r) => r.json())
            .then(({ data, error }) => ({
              data: data && data.length ? data[0] : null,
              error,
            }));
        },
      }),
      then: async (onfulfilled?: (value: any) => any) => {
        try {
          const res = await fetch("/api/mock-supabase", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "dbInsert",
              table: this.table,
              payload: { rows },
            }),
          });
          const data = await res.json();
          if (onfulfilled) return onfulfilled(data);
          return data;
        } catch (e: any) {
          const err = { data: null, error: { message: e.message } };
          if (onfulfilled) return onfulfilled(err);
          return err;
        }
      },
    };
  }

  update(values: any) {
    return {
      eq: (matchCol: string, matchVal: any) => {
        return {
          then: async (onfulfilled?: (value: any) => any) => {
            try {
              const res = await fetch("/api/mock-supabase", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  action: "dbUpdate",
                  table: this.table,
                  payload: { matchCol, matchVal, values },
                }),
              });
              const data = await res.json();
              if (onfulfilled) return onfulfilled(data);
              return data;
            } catch (e: any) {
              const err = { data: null, error: { message: e.message } };
              if (onfulfilled) return onfulfilled(err);
              return err;
            }
          },
        };
      },
    };
  }

  upsert(row: any) {
    return {
      then: async (onfulfilled?: (value: any) => any) => {
        try {
          const res = await fetch("/api/mock-supabase", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "dbUpsert",
              table: this.table,
              payload: { row },
            }),
          });
          const data = await res.json();
          if (onfulfilled) return onfulfilled(data);
          return data;
        } catch (e: any) {
          const err = { data: null, error: { message: e.message } };
          if (onfulfilled) return onfulfilled(err);
          return err;
        }
      },
    };
  }
}

const mockAuth = {
  getUser: async () => {
    try {
      const res = await fetch("/api/mock-supabase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "getUser" }),
      });
      return await res.json();
    } catch (e: any) {
      return { data: { user: null }, error: { message: e.message } };
    }
  },
  signUp: async (payload: any) => {
    try {
      const res = await fetch("/api/mock-supabase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "signUp", payload }),
      });
      return await res.json();
    } catch (e: any) {
      return { data: { user: null, session: null }, error: { message: e.message } };
    }
  },
  signInWithPassword: async (payload: any) => {
    try {
      const res = await fetch("/api/mock-supabase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "signIn", payload }),
      });
      return await res.json();
    } catch (e: any) {
      return { data: { user: null, session: null }, error: { message: e.message } };
    }
  },
  signOut: async () => {
    try {
      const res = await fetch("/api/mock-supabase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "signOut" }),
      });
      return await res.json();
    } catch (e: any) {
      return { error: { message: e.message } };
    }
  },
};

const mockSupabaseClient = {
  auth: mockAuth,
  from: (table: string) => {
    return new MockQueryBuilder(table);
  },
};

const mockMutatorClient = {
  auth: mockAuth,
  from: (table: string) => {
    return new MockDbMutator(table);
  },
};

export function createClient() {
  if (isMockMode) {
    // Return custom mock proxy that handles both query builders and mutators seamlessly
    return new Proxy({} as any, {
      get(target, prop) {
        if (prop === "auth") return mockAuth;
        if (prop === "from") {
          return (table: string) => {
            // For insertions/updates, use MockDbMutator. For selects, use MockQueryBuilder.
            // A simple proxy lets us dynamically choose or support all methods.
            const queryBuilder = new MockQueryBuilder(table);
            const mutator = new MockDbMutator(table);
            
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
        return (mockSupabaseClient as any)[prop];
      }
    });
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
