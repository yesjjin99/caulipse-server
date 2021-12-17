const options = {
  swaggerDefinition: {
    info: {
      title: 'caulipse-server',
      description: 'caulipse 프로젝트 관련 api 문서',
      version: '1.0.0',
    },
    host: 'localhost:3000',
    basePath: '/',
  },
  apis: ['**/*.ts'],
};

export default options;
