import * as fastify from 'fastify';
import * as staticServer from 'fastify-static';

const app = fastify();

export const useServer = async (port: number, rootPath: string) => {
  app.register(staticServer, {
    root: rootPath,
  });

  app.get('/', function(req, reply) {
    reply.sendFile('index.html');
  });

  await app.listen(port);
};
