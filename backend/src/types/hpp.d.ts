declare module 'hpp' {
  import { RequestHandler } from 'express';
  const hpp: (options?: unknown) => RequestHandler;
  export default hpp;
}


