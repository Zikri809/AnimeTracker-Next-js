declare global {
  namespace NodeJS {
    interface ProcessEnv {
      Client_ID: string;
      Client_Secret: string;
      NEXT_PUBLIC_Local_host: string;
      Prod_host: string;
      dev_auth_redirect: string;
      prod_auth_redirect: string;
    }
  }
}

export {};
