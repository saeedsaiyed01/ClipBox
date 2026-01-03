import 'next-auth';

declare module 'next-auth' {
  interface Session {
    backendToken?: string;
  }

  interface JWT {
    backendToken?: string;
  }

  interface Account {
    backendToken?: string;
  }
}

declare module 'next-auth/providers/google' {
  interface GoogleProfile {
    picture?: string;
  }
}