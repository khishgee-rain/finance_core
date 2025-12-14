import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      currency?: string;
      payday15?: boolean;
      payday30?: boolean;
      salaryAmount?: any;
    };
  }

  interface User {
    id: string;
    name: string;
    email: string;
    currency?: string;
    payday15?: boolean;
    payday30?: boolean;
    salaryAmount?: any;
  }
}
