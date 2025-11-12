/* global use, db */
// MongoDB Playground
// To disable this template go to Settings | MongoDB | Use Default Template For Playground.
// Make sure you are connected to enable completions and to be able to run a playground.
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.
// The result of the last command run in a playground is shown on the results panel.
// By default the first 20 documents will be returned with a cursor.
// Use 'console.log()' to print to the debug output.
// For more documentation on playgrounds please refer to
// https://www.mongodb.com/docs/mongodb-vscode/playgrounds/

// Seleciona o banco de dados
use('marketplace');

// Drop nas coleções para recomeçar os testes
db.users.drop();
db.products.drop();
db.categories.drop();
db.orders.drop();
db.reviews.drop();

db.counters.drop();

db.counters.insertMany([
  { _id: "userId", seq: 0 },
  { _id: "productId", seq: 0 },
  { _id: "ordersId", seq: 0 },
  { _id: "reviewId", seq: 0 }
]);

function getNextSequenceValue(sequenceName) {
  const sequenceDocument = db.counters.findOneAndUpdate(
    { _id: sequenceName },
    { $inc: { seq: 1 } },
    { returnDocument: "after" }
  );
  return sequenceDocument.seq;
}

// ---------------- 2) Criação das collections com validação JSON Schema ----------------



// Users
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['nome', 'email', 'senha'],
      properties: {
        nome: { bsonType: 'string' },
        email: { bsonType: 'string', pattern: '^.+@.+\\..+$' },
        senha: { bsonType: 'string' },
        endereco: {
          bsonType: 'object',
          properties: {
            rua: { bsonType: 'string' },
            numero: { bsonType: 'string' },
            cidade: { bsonType: 'string' },
            estado: { bsonType: 'string' },
            cep: { bsonType: 'string' },
            pais: { bsonType: 'string' }
          }
        },
        localizacao_geografica: {
          bsonType: 'object',
          properties: {
            type: {  bsonType: 'string', enum: ['Point'] },
            coordinates: { bsonType: 'array', minItems: 2, maxItems: 2 }
          }
        },
        pontos_fidelidade: { bsonType: 'int', minimum: 0 }
      }
    }
  }
});

// Categories 
db.createCollection('categories', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name'],
      properties: { name: { bsonType: 'string' }, parentId: { bsonType: 'objectId' } }
    }
  }
});

// Products 
db.createCollection('products', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['nome', 'preco', 'quantidade_disponivel', 'categoria', 'vendedor'],
      properties: {
        nome: { bsonType: 'string' },
        descricao: { bsonType: 'string' },
        preco: {
          bsonType: 'object',
          required: ['valor', 'moeda'],
          properties: {
            valor: { bsonType: ['double', 'int', 'decimal'] },
            moeda: { bsonType: 'string' }
          }
        },
        quantidade_disponivel: { bsonType: 'int' },
        categoria: { bsonType: 'string' },
        promocoes_ativas: {
          bsonType: 'array',
          items: {
            bsonType: 'object',
            required: ['discount', 'start', 'end'],
            properties: {
              discount: { bsonType: ['double', 'int'] },
              start: { bsonType: 'date' },
              end: { bsonType: 'date' }
            }
          }
        },
        vendedor: { bsonType: 'string', pattern: '^.+@.+\\..+$' },
        localizacao_geografica: {
          bsonType: 'object',
          required: ['type', 'coordinates'],
          properties: {
            type: { enum: ['Point'] },
            coordinates: {
              bsonType: 'array',
              items: [{ bsonType: 'double' }, { bsonType: 'double' }],
              description: '[longitude, latitude]'
            }
          }
        }
      }
    }
  }
});

// Orders 
db.createCollection('orders', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['usuario_id', 'usuario_email', 'items', 'total', 'status', 'data'],
      properties: {
        usuario_id: { bsonType: 'int' },
        usuario_email: { bsonType: 'string', pattern: '^.+@.+\\..+$' },
        items: {
          bsonType: 'array',
          minItems: 1,
          items: {
            bsonType: 'object',
            required: ['product', 'qty'],
            properties: {
              product: { bsonType: 'string' },
              qty: { bsonType: 'int' }
            }
          }
        },
        total: { bsonType: ['double', 'int', 'decimal'] },
        status: { enum: ['completo', 'em trânsito', 'entregue', 'pendente', 'cancelado'] },
        data: { bsonType: 'date' },
        pontos_fidelidade_gerados: { bsonType: 'int' }
      }
    }
  }
});

// Reviews
db.createCollection('reviews', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['userId', 'productName', 'rating', 'comment', 'date'],
      properties: {
        userId: { bsonType: 'int' },
        productName: { bsonType: 'string' },
        rating: { bsonType: 'int', minimum: 1, maximum: 5 },
        comment: { bsonType: 'string' },
        date: { bsonType: 'date' }
      }
    }
  }
});

// ---------------- 3) Inserts ----------------

// USERS (IDs numéricos gerados via contador)
// senha hasheada com bcrypt
db.getCollection('users').insertMany([
  {
    _id: getNextSequenceValue("userId"),
    nome: "Ana Silva",
    email: "ana@example.com",
    senha: "$2b$10$Qj8u9QyPH3vP.yoA9l/qwOFUG5CNlJxHuyF1Svsf3vZh5/1QmCPWe",
    endereco: {
      rua: "Rua das Flores",
      numero: "123",
      cidade: "São Paulo",
      estado: "SP",
      cep: "01000-000",
      pais: "BR"
    },
    localizacao_geografica: { type: "Point", coordinates: [-46.633309, -23.55052] },
    pontos_fidelidade: 0
  },
  {
    _id: getNextSequenceValue("userId"),
    nome: "Eduardo Erthal",
    email: "eduardo@exemplo.com",
    senha: "$2b$10$9QepDZZx4I3Lk7q/ONi6aOXxXcfhBbe6O0rkDPSQ7Pnd.2Ty6E9Ca",
    endereco: {
      rua: "Avenida Central",
      numero: "500",
      cidade: "Rio de Janeiro",
      estado: "RJ",
      cep: "20000-000",
      pais: "BR"
    },
    localizacao_geografica: { type: "Point", coordinates: [-43.209373, -22.903539] },
    pontos_fidelidade: 0
  },
  {
    _id: getNextSequenceValue("userId"),
    nome: "Leo Pedreiro",
    email: "leonardo@exemplo.com",
    senha: "$2b$10$N7mD0xW52bV/npgpVy9Zpe8CBPiIYfDQpd07zRokjJwyzT8S0z0.q",
    endereco: {
      rua: "Travessa do Sol",
      numero: "45",
      cidade: "Belo Horizonte",
      estado: "MG",
      cep: "30000-000",
      pais: "BR"
    },
    localizacao_geografica: { type: "Point", coordinates: [-43.940539, -19.920833] },
    pontos_fidelidade: 0
  },
  {
    _id: getNextSequenceValue("userId"),
    nome: "Mil Enas",
    email: "Thousand@exemplo.com",
    senha: "$2b$10$hR9ReEnR4PR71YtCOxjVquMSu9UnjQfwDF2Ux4NQZp0jKZbRHysu2",
    endereco: {
      rua: "Rua do Mercado",
      numero: "10",
      cidade: "Curitiba",
      estado: "PR",
      cep: "80000-000",
      pais: "BR"
    },
    localizacao_geografica: { type: "Point", coordinates: [-49.264587, -25.428954] },
    pontos_fidelidade: 0
  },
  {
    _id: getNextSequenceValue("userId"),
    nome: "Jon Doe",
    email: "jondoe@exemplo.com",
    senha: "$2b$10$7BArC3RcmcBohHjD2QHdHuN9oZmiCEbMRRj70PMdQURuG6LqHhFce",
    endereco: {
      rua: "Alameda Verde",
      numero: "77",
      cidade: "Porto Alegre",
      estado: "RS",
      cep: "90000-000",
      pais: "BR"
    },
    localizacao_geografica: { type: "Point", coordinates: [-51.2302, -30.0277] },
    pontos_fidelidade: 0
  },
  {
    _id: getNextSequenceValue("userId"),
    nome: "Dude Person",
    email: "dudeperson@exemplo.com",
    senha: "$2b$10$y6q5oAOc4as5XyKmDG1dE.7nEQfTf4rSEc1tOlYb8gTMyBhy1n.8G",
    endereco: {
      rua: "Praça do Comércio",
      numero: "1",
      cidade: "Salvador",
      estado: "BA",
      cep: "40000-000",
      pais: "BR"
    },
    localizacao_geografica: { type: "Point", coordinates: [-38.5023, -12.9714] },
    pontos_fidelidade: 0
  }
]);


// PRODUCTS
db.products.insertMany([
  {
    _id: getNextSequenceValue("productId"),
    nome: "Fone sem fio",
    descricao: "Fone bluetooth sem fio, bateria de longa duração.",
    preco: { valor: 199.9, moeda: "BRL" },
    quantidade_disponivel: 10,
    localizacao: "São Paulo",
    localizacao_geografica: { type: "Point", coordinates: [-46.633309, -23.55052] },
    categoria: "eletrônicos",
    promocoes_ativas: [],
    vendedor: "ana@example.com"
  },
  {
    _id: getNextSequenceValue("productId"),
    nome: "Televisor",
    descricao: "Televisor LED 55'' com resolução 4K.",
    preco: { valor: 2500, moeda: "BRL" },
    quantidade_disponivel: 5,
    localizacao: "Rio de Janeiro",
    localizacao_geografica: { type: "Point", coordinates: [-43.2093727, -22.9110137] },
    categoria: "eletrônicos",
    promocoes_ativas: [],
    vendedor: "eduardo@exemplo.com"
  },
  {
    _id: getNextSequenceValue("productId"),
    nome: "É Jordão",
    descricao: "Item variado / colecionável (descrição original preservada no título).",
    preco: { valor: 822.8, moeda: "BRL" },
    quantidade_disponivel: 3,
    localizacao: "Minas Gerais",
    localizacao_geografica: { type: "Point", coordinates: [-44.55503, -19.9333] },
    categoria: "colecionáveis",
    promocoes_ativas: [],
    vendedor: "leonardo@exemplo.com"
  },
  {
    _id: getNextSequenceValue("productId"),
    nome: "Adidas Sambódromo",
    descricao: "Tênis / calçado Adidas edição Sambódromo.",
    preco: { valor: 456.4, moeda: "BRL" },
    quantidade_disponivel: 20,
    localizacao: "Paraná",
    localizacao_geografica: { type: "Point", coordinates: [-49.264587, -25.428954] },
    categoria: "vestuário",
    promocoes_ativas: [],
    vendedor: "Thousand@exemplo.com"
  },
  {
    _id: getNextSequenceValue("productId"),
    nome: "Regata Minnesotta Timberwolves City Edition 2025/26",
    descricao: "Regata oficial Timberwolves - edição City 2025/26.",
    preco: { valor: 380, moeda: "BRL" },
    quantidade_disponivel: 15,
    localizacao: "Rio Grande do Sul",
    localizacao_geografica: { type: "Point", coordinates: [-51.230, -30.033] },
    categoria: "vestuário",
    promocoes_ativas: [],
    vendedor: "jondoe@exemplo.com"
  },
  {
    _id: getNextSequenceValue("productId"),
    nome: "Camisa Crontias Total 80",
    descricao: "Camisa esportiva - coleção Total 80.",
    preco: { valor: 49, moeda: "BRL" },
    quantidade_disponivel: 50,
    localizacao: "Bahia",
    localizacao_geografica: { type: "Point", coordinates: [-38.512382, -12.9714] },
    categoria: "vestuário",
    promocoes_ativas: [],
    vendedor: "dudeperson@exemplo.com"
  },
  {
    _id: getNextSequenceValue("productId"),
    nome: "Bola Brazuka copa 2014 (mto raro)",
    descricao: "Bola da Copa 2014 - item de colecionador, muito rara.",
    preco: { valor: 900000, moeda: "BRL" },
    quantidade_disponivel: 1,
    localizacao: "São Paulo",
    localizacao_geografica: { type: "Point", coordinates: [-46.633309, -23.55052] },
    categoria: "colecionáveis",
    promocoes_ativas: [],
    vendedor: "ana@example.com"
  },
  {
    _id: getNextSequenceValue("productId"),
    nome: "A famosa jabulani copa 2010 (mais raro ainda)",
    descricao: "Jabulani 2010 - peça de colecionador, extremamente rara.",
    preco: { valor: 10000000, moeda: "USD" },
    quantidade_disponivel: 1,
    localizacao: "Rio de Janeiro",
    localizacao_geografica: { type: "Point", coordinates: [-43.2093727, -22.9110137] },
    categoria: "colecionáveis",
    promocoes_ativas: [],
    vendedor: "eduardo@exemplo.com"
  },
  {
    _id: getNextSequenceValue("productId"),
    nome: "Sacola plástica 40x90mm",
    descricao: "SACOLA plástica resistente 40x90mm (pacote).",
    preco: { valor: 49, moeda: "BRL" },
    quantidade_disponivel: 200,
    localizacao: "Minas Gerais",
    localizacao_geografica: { type: "Point", coordinates: [-44.55503, -19.9333] },
    categoria: "embalagem",
    promocoes_ativas: [],
    vendedor: "leonardo@exemplo.com"
  },
  {
    _id: getNextSequenceValue("productId"),
    nome: "Caixa de papelão 250x80x190mm",
    descricao: "Caixa de papelão para transporte e armazenamento.",
    preco: { valor: 60, moeda: "BRL" },
    quantidade_disponivel: 120,
    localizacao: "Paraná",
    localizacao_geografica: { type: "Point", coordinates: [-49.264587, -25.428954] },
    categoria: "embalagem",
    promocoes_ativas: [],
    vendedor: "Thousand@exemplo.com"
  },
  {
    _id: getNextSequenceValue("productId"),
    nome: "Carro pika",
    descricao: "Veículo usado - descrição breve preservada no título.",
    preco: { valor: 9000000, moeda: "BRL" },
    quantidade_disponivel: 1,
    localizacao: "Rio Grande do Sul",
    localizacao_geografica: { type: "Point", coordinates: [-51.230, -30.033] },
    categoria: "veículos",
    promocoes_ativas: [],
    vendedor: "jondoe@exemplo.com"
  },
  {
    _id: getNextSequenceValue("productId"),
    nome: "Celta 2012",
    descricao: "Celta ano 2012, usado.",
    preco: { valor: 4500, moeda: "BRL" },
    quantidade_disponivel: 1,
    localizacao: "Bahia",
    localizacao_geografica: { type: "Point", coordinates: [-38.512382, -12.9714] },
    categoria: "veículos",
    promocoes_ativas: [],
    vendedor: "dudeperson@exemplo.com"
  }
]);


// ORDERS
db.getCollection('orders').insertMany([
  {
    _id: getNextSequenceValue("ordersId"),
    usuario_id: 1,
    usuario_email: "ana@example.com",
    items: [{ product: "Fone sem fio", qty: 1 }],
    total: 199.9,
    status: "completo",
    data: new Date("2025-10-01T10:15:00.000Z"),
    pontos_fidelidade_gerados: 19
  },
  {
    _id: getNextSequenceValue("ordersId"),
    usuario_id: 2,
    usuario_email: "eduardo@exemplo.com",
    items: [{ product: "Televisor", qty: 1 }],
    total: 2500,
    status: "em trânsito",
    data: new Date("2025-09-20T14:30:00.000Z"),
    pontos_fidelidade_gerados: 250
  },
  {
    _id: getNextSequenceValue("ordersId"),
    usuario_id: 3,
    usuario_email: "leonardo@exemplo.com",
    items: [{ product: "É Jordão", qty: 2 }],
    total: 1645.6,
    status: "completo",
    data: new Date("2025-10-10T09:00:00.000Z"),
    pontos_fidelidade_gerados: 164
  },
  {
    _id: getNextSequenceValue("ordersId"),
    usuario_id: 4,
    usuario_email: "Thousand@exemplo.com",
    items: [
      { product: "Regata Minnesotta Timberwolves City Edition 2025/26", qty: 1 },
      { product: "Camisa Crontias Total 80", qty: 1 }
    ],
    total: 429,
    status: "entregue",
    data: new Date("2025-08-15T16:45:00.000Z"),
    pontos_fidelidade_gerados: 42
  },
  {
    _id: getNextSequenceValue("ordersId"),
    usuario_id: 5,
    usuario_email: "jondoe@exemplo.com",
    items: [{ product: "Caixa de papelão 250x80x190mm", qty: 5 }],
    total: 300,
    status: "completo",
    data: new Date("2025-10-05T11:20:00.000Z"),
    pontos_fidelidade_gerados: 30
  },
  {
    _id: getNextSequenceValue("ordersId"),
    usuario_id: 6,
    usuario_email: "dudeperson@exemplo.com",
    items: [{ product: "Celta 2012", qty: 1 }],
    total: 4500,
    status: "pendente",
    data: new Date("2025-10-25T08:00:00.000Z"),
    pontos_fidelidade_gerados: 450
  },
  {
    _id: getNextSequenceValue("ordersId"),
    usuario_id: 1,
    usuario_email: "ana@example.com",
    items: [{ product: "Adidas Sambódromo", qty: 2 }],
    total: 912.8,
    status: "completo",
    data: new Date("2025-09-30T12:00:00.000Z"),
    pontos_fidelidade_gerados: 91
  },
  {
    _id: getNextSequenceValue("ordersId"),
    usuario_id: 2,
    usuario_email: "eduardo@exemplo.com",
    items: [{ product: "A famosa jabulani copa 2010 (mais raro ainda)", qty: 1 }],
    total: 10000000,
    status: "completo",
    data: new Date("2025-07-01T07:30:00.000Z"),
    pontos_fidelidade_gerados: 1000000
  },
  {
    _id: getNextSequenceValue("ordersId"),
    usuario_id: 3,
    usuario_email: "leonardo@exemplo.com",
    items: [
      { product: "Televisor", qty: 2 },
      { product: "Fone sem fio", qty: 2 }
    ],
    total: 5399.8,
    status: "em trânsito",
    data: new Date("2025-10-12T13:10:00.000Z"),
    pontos_fidelidade_gerados: 539
  },
  {
    _id: getNextSequenceValue("ordersId"),
    usuario_id: 4,
    usuario_email: "Thousand@exemplo.com",
    items: [
      { product: "Caixa de papelão 250x80x190mm", qty: 2 },
      { product: "Sacola plástica 40x90mm", qty: 3 }
    ],
    total: 267,
    status: "cancelado",
    data: new Date("2025-09-01T18:00:00.000Z"),
    pontos_fidelidade_gerados: 26
  }
]);

// REVIEWS 
db.getCollection('reviews').insertMany([
  {
    _id: getNextSequenceValue("reviewId"),
    userId: 1,
    productName: "Fone sem fio",
    rating: 5,
    comment: "Ótimo fone, bateria dura muito!",
    date: new Date("2025-10-26")
  },
  {
    _id: getNextSequenceValue("reviewId"),
    userId: 2,
    productName: "Televisor",
    rating: 5,
    comment: "Imagem perfeita, recomendo muito",
    date: new Date("2025-10-25")
  },
  {
    _id: getNextSequenceValue("reviewId"),
    userId: 3,
    productName: "É Jordão",
    rating: 4,
    comment: "Tênis muito bom, só achei um pouco caro",
    date: new Date("2025-10-24")
  },
  {
    _id: getNextSequenceValue("reviewId"),
    userId: 4,
    productName: "Regata Minnesotta Timberwolves City Edition 2025/26",
    rating: 5,
    comment: "me sinto o ja morant <3",
    date: new Date("2025-10-24")
  },
  {
    _id: getNextSequenceValue("reviewId"),
    userId: 5,
    productName: "Camisa Crontias Total 80",
    rating: 5,
    comment: "nostalgia pura, meu pai torcia para o crontias em 507 d.C, quando vencemos Tenochtitlán",
    date: new Date("2025-10-24")
  },
  {
    _id: getNextSequenceValue("reviewId"),
    userId: 3,
    productName: "Caixa de papelão 250x80x190mm",
    rating: 4,
    comment: "Caixas resistentes, cumprem o prometido",
    date: new Date("2025-10-23")
  },
  {
    _id: getNextSequenceValue("reviewId"),
    userId: 6,
    productName: "Celta 2012",
    rating: 3,
    comment: "Carro econômico, motor bom, só precisa de uma regulagem",
    date: new Date("2025-10-22")
  },
  {
    _id: getNextSequenceValue("reviewId"),
    userId: 4,
    productName: "Adidas Sambódromo",
    rating: 5,
    comment: "Tênis lindo demais, super confortável, faltou uma listra",
    date: new Date("2025-10-21")
  },
  {
    _id: getNextSequenceValue("reviewId"),
    userId: 2,
    productName: "A famosa jabulani copa 2010 (mais raro ainda)",
    rating: 1,
    comment: "a bola era falsa :(",
    date: new Date("2025-10-20")
  },
  {
    _id: getNextSequenceValue("reviewId"),
    userId: 2,
    productName: "Televisor",
    rating: 2,
    comment: "Segunda TV que compro dessa marca, mas infelizmente nenhuma funciona",
    date: new Date("2025-10-19")
  },
  {
    _id: getNextSequenceValue("reviewId"),
    userId: 1,
    productName: "Fone sem fio",
    rating: 4,
    comment: "Muito bom, mas a conexão às vezes falha",
    date: new Date("2025-10-19")
  },
  {
    _id: getNextSequenceValue("reviewId"),
    userId: 3,
    productName: "Caixa de papelão 250x80x190mm",
    rating: 5,
    comment: "Ótimas para organização, muito resistentes",
    date: new Date("2025-10-18")
  },
  {
    _id: getNextSequenceValue("reviewId"),
    userId: 3,
    productName: "Sacola plástica 40x90mm",
    rating: 4,
    comment: "Boas sacolas, resistentes e práticas",
    date: new Date("2025-10-18")
  }
]);

// ---------------- 4) Índices ----------------
// Justificativa resumo:
// - products: index em categoryId (buscas por categoria) + text index em name/description se pesquisa full-text
// - products: geospatial 2dsphere em location (para buscas por proximidade)
// - transactions: index em sellerId, buyerId, date (relatórios por vendedor e temporal)
// - reviews: index em productId para busca rápida de avaliações
// - users: index em email (login único)

// Criação de índices:
// Produtos
db.products.createIndex({ categoria: 1 }); // Busca por categoria 
db.products.createIndex({ nome: 'text', descricao: 'text' }); // Pesquisa textual
db.products.createIndex({ "localizacao_geografica": "2dsphere" }); // Busca por localização textual (se quiser geoespacial: usar 2dsphere em localizacao_geografica)

// Pedidos (equivalente à transactions)
db.orders.createIndex({ usuario_id: 1, data: -1 }); // Consultas por usuário e data (histórico)
db.orders.createIndex({ status: 1 }); // Filtros por status (pendente, entregue, etc)

// Avaliações
db.reviews.createIndex({ productName: 1 }); // Buscas por produto avaliado

// Usuários
db.users.createIndex({ email: 1 }, { unique: true }); // Login rápido e seguro
db.users.createIndex({ localizacao_geografica: "2dsphere" });


// ---------------- 5) Consultas Básicas ----------------

// 1) Encontrar todos os produtos de uma categoria específica
const eletronicos = db.products.find({ categoria: "eletrônicos" }).toArray();
print("Produtos Eletrônicos:", JSON.stringify(eletronicos, null, 2));

// 2) Buscar todas as avaliações de um produto
const avaliacoesFone = db.reviews.find({ productName: "Fone sem fio" }).toArray();
print("Avaliações de Fone sem fio:", JSON.stringify(avaliacoesFone, null, 2));

// 3) Criar uma nova compra (transação)
function criarCompra(usuario_id, produto_nome, quantidade) {
  const produto = db.products.findOne({ nome: produto_nome });
  if (!produto) throw "Produto não encontrado.";
  if (produto.quantidade_disponivel < quantidade) throw "Estoque insuficiente.";

  const total = produto.preco.valor * quantidade;
  const pontos = Math.floor(total * 0.01); // 1% em pontos fidelidade

  // Inserir pedido
  const pedido = db.orders.insertOne({
    usuario_id,
    usuario_email: db.users.findOne({ _id: usuario_id }).email,
    items: [{ product: produto.nome, qty: quantidade }],
    total,
    status: "pendente",
    data: new Date(),
    pontos_fidelidade_gerados: pontos
  });

  // Atualizar estoque
  db.products.updateOne({ nome: produto_nome }, { $inc: { quantidade_disponivel: -quantidade } });

  // Atualizar pontos do usuário
  db.users.updateOne({ _id: usuario_id }, { $inc: { pontos_fidelidade: pontos } });

  print(`Compra criada com sucesso. ID: ${pedido.insertedId}`);
  return pedido.insertedId;
}

// Exemplo de uso:
// criarCompra(1, "Fone sem fio", 1);

// 4) Atualizar quantidade de produto após compra
db.products.updateOne({ nome: "Fone sem fio" }, { $inc: { quantidade_disponivel: -1 } });


// ---------------- 6) Agregações ----------------

// 6.1 Calcular a média de avaliação por produto
const avgRatingPerProduct = db.reviews.aggregate([
  {
    $group: {
      _id: "$productName",
      avgRating: { $avg: "$rating" },
      totalAvaliacoes: { $sum: 1 }
    }
  },
  {
    $project: {
      _id: 0,
      produto: "$_id",
      mediaAvaliacoes: { $round: ["$avgRating", 2] },
      totalAvaliacoes: 1
    }
  }
]).toArray();

print("Média de avaliação por produto:", JSON.stringify(avgRatingPerProduct, null, 2));


// 6.2 Calcular o total de vendas por categoria
// Desmembra os items, junta com os produtos para pegar a categoria e agrupa

const vendasPorCategoria = db.orders.aggregate([
  { $unwind: "$items" },
  {
    $lookup: {
      from: "products",
      localField: "items.product",
      foreignField: "nome",
      as: "produto"
    }
  },
  { $unwind: "$produto" },
  {
    $group: {
      _id: "$produto.categoria",
      receitaTotal: { $sum: { $multiply: ["$items.qty", "$produto.preco.valor"] } },
      quantidadeVendida: { $sum: "$items.qty" }
    }
  },
  {
    $project: {
      _id: 0,
      categoria: "$_id",
      receitaTotal: { $round: ["$receitaTotal", 2] },
      quantidadeVendida: 1
    }
  }
]).toArray();

print("Total de vendas por categoria:", JSON.stringify(vendasPorCategoria, null, 2));

// -----------------------------------------------------------

// 6.3 Relatórios de vendas por vendedor (quantidade vendida e receita total)

const vendasPorVendedor = db.orders.aggregate([
  { $unwind: "$items" },
  {
    $lookup: {
      from: "products",
      localField: "items.product",
      foreignField: "nome",
      as: "produto"
    }
  },
  { $unwind: "$produto" },
  {
    $group: {
      _id: "$produto.vendedor_id", // precisa existir no documento de produto
      receita: { $sum: { $multiply: ["$items.qty", "$produto.preco.valor"] } },
      quantidadeVendida: { $sum: "$items.qty" }
    }
  },
  {
    $lookup: {
      from: "users",
      localField: "_id",
      foreignField: "_id",
      as: "vendedor"
    }
  },
  { $unwind: { path: "$vendedor", preserveNullAndEmptyArrays: true } },
  {
    $project: {
      _id: 0,
      vendedor: "$vendedor.nome",
      receita: { $round: ["$receita", 2] },
      quantidadeVendida: 1
    }
  }
]).toArray();

print("Relatório de vendas por vendedor:", JSON.stringify(vendasPorVendedor, null, 2));


// ---------------- 7) Sprint 2: Novos requisitos e migrações ----------------

// 7.1 Inserir promoção em um produto específico
const produtoPromo = db.products.findOne({ nome: "Fone sem fio" });
if (produtoPromo) {
  db.products.updateOne(
    { _id: produtoPromo._id },
    {
      $push: {
        promocoes_ativas: {
          discount: 0.1, // 10% de desconto
          start: new Date("2025-11-10"),
          end: new Date("2025-11-20")
        }
      }
    }
  );
  print("7.1: Promoção adicionada ao 'Fone sem fio'.");
} else {
  print("7.1: Produto 'Fone sem fio' não encontrado. Promoção NÃO adicionada.");
}

// 7.2 Backfill: garantir que todos os usuários tenham pontos de fidelidade
db.users.updateMany(
  { pontos_fidelidade: { $exists: false } },
  { $set: { pontos_fidelidade: 0 } }
);
print("7.2: Backfill de pontos_fidelidade concluído.");

// 7.3 Resposta do vendedor a uma review
const reviewAlvo = db.reviews.findOne({ productName: "Fone sem fio" });
if (reviewAlvo) {
  db.reviews.updateOne(
    { _id: reviewAlvo._id },
    {
      $set: {
        response: {
          sellerEmail: "ana@example.com",
          texto: "Obrigado pelo feedback!",
          data: new Date()
        }
      }
    }
  );
  print("7.3: Resposta do vendedor adicionada à review.");
} else {
  print("7.3: Nenhuma review encontrada para 'Fone sem fio'.");
}

// 7.4 Atualizar usuários existentes para incluir localização
db.users.updateMany(
  { localizacao_geografica: { $exists: false } },
  {
    $set: {
      localizacao_geografica: { type: "Point", coordinates: [-46.633309, -23.55052] }
    }
  }
);
print("7.4: Localização geográfica padrão aplicada a usuários faltantes.");

// 7.5 Buscar produtos a até 30 km da localização do usuário
const user = db.users.findOne({ email: "ana@example.com" });
if (user && user.localizacao_geografica) {
  const produtosProximos = db.products.find({
    localizacao_geografica: {
      $near: {
        $geometry: user.localizacao_geografica,
        $maxDistance: 30000 // 30 km
      }
    }
  }).toArray();
  print("7.5: Produtos próximos (30km):", JSON.stringify(produtosProximos, null, 2));
} else {
  print("7.5: Usuário 'ana@example.com' não encontrado ou sem localização.");
}

// ---------------- 8) Consultas Avançadas (geospatial + análises) ----------------

// 8.1 Buscar produtos próximos ao usuário dentro de um raio X (metros)
function findProductsNear(userId, radiusMeters) {
  const user = db.users.findOne({ _id: userId });
  if (!user || !user.localizacao_geografica) {
    print(`Usuário com _id=${userId} não encontrado ou sem localização.`);
    return [];
  }
  return db.products.find({
    localizacao_geografica: {
      $near: {
        $geometry: user.localizacao_geografica,
        $maxDistance: radiusMeters
      }
    }
  }).toArray();
}

// Exemplo: produtos dentro de 50km (50000m) do usuário com _id = 1
const nearby = findProductsNear(1, 50000);
print('8.1 Produtos próximos (50km):', JSON.stringify(nearby, null, 2));

// 8.2 Calcular a média de distância entre compradores e vendedores (ajustado para schema real)
const avgDistance = db.orders.aggregate([
  { $match: { status: { $in: ["completo", "entregue"] } } },
  { $unwind: "$items" },
  {
    $lookup: {
      from: "users",
      localField: "usuario_id",
      foreignField: "_id",
      as: "comprador"
    }
  },
  { $unwind: "$comprador" },
  {
    $lookup: {
      from: "products",
      localField: "items.product",
      foreignField: "nome",
      as: "produto"
    }
  },
  { $unwind: "$produto" },
  {
    $lookup: {
      from: "users",
      localField: "produto.vendedor",
      foreignField: "email",
      as: "vendedor"
    }
  },
  { $unwind: "$vendedor" },
  {
    $match: {
      "comprador.localizacao_geografica": { $exists: true },
      "vendedor.localizacao_geografica": { $exists: true }
    }
  },
  {
    $project: {
      distKm: {
        $let: {
          vars: {
            lat1: { $arrayElemAt: ["$comprador.localizacao_geografica.coordinates", 1] },
            lng1: { $arrayElemAt: ["$comprador.localizacao_geografica.coordinates", 0] },
            lat2: { $arrayElemAt: ["$vendedor.localizacao_geografica.coordinates", 1] },
            lng2: { $arrayElemAt: ["$vendedor.localizacao_geografica.coordinates", 0] }
          },
          in: {
            $multiply: [
              111.195,
              {
                $sqrt: {
                  $add: [
                    { $pow: [{ $subtract: ["$$lat1", "$$lat2"] }, 2] },
                    { $pow: [{ $subtract: ["$$lng1", "$$lng2"] }, 2] }
                  ]
                }
              }
            ]
          }
        }
      }
    }
  },
  {
    $group: {
      _id: null,
      avgDistanceKm: { $avg: "$distKm" }
    }
  }
]).toArray();

print('8.2 Distância média (km) entre comprador e vendedor:', JSON.stringify(avgDistance, null, 2));

// 8.3 Encontrar a categoria de produto mais vendida em uma área geográfica específica
function mostSoldCategoryInArea(centerLng, centerLat, radiusMeters) {
  const earthRadius = 6378137;
  const radiusInRadians = radiusMeters / earthRadius;

  return db.products.aggregate([
    {
      $match: {
        localizacao_geografica: {
          $geoWithin: {
            $centerSphere: [[centerLng, centerLat], radiusInRadians]
          }
        }
      }
    },
    {
      $lookup: {
        from: "orders",
        localField: "nome",
        foreignField: "items.product",
        as: "pedidos"
      }
    },
    { $unwind: "$pedidos" },
    { $unwind: "$pedidos.items" },
    { $match: { $expr: { $eq: ["$nome", "$pedidos.items.product"] } } },
    {
      $group: {
        _id: "$categoria",
        totalQty: { $sum: "$pedidos.items.qty" }
      }
    },
    { $sort: { totalQty: -1 } },
    { $limit: 1 }
  ]).toArray();
}

const mostSold = mostSoldCategoryInArea(-49.264587, -25.428954, 50000);
print('8.3 Categoria mais vendida na área:', JSON.stringify(mostSold, null, 2));

// ---------------- 9) Tópicos Complementares de Performance ----------------

// 9.1 explain() em consultas
db.products.createIndex({ categoria: 1 }, { background: true });
db.orders.createIndex({ usuario_id: 1, data: -1 }, { background: true });

print("\n9.1 EXPLAIN: Busca de produtos por categoria (com índice)");
printjson(
  db.products.find({ categoria: "eletrônicos" }).explain("executionStats")
);

// ---------------- 9.2 Comparação: Embed vs Reference ----------------

// a) Modelo EMBED
db.orders.insertOne({
  usuario_id: 1,
  items: [
    { nome: "Fone sem fio", preco: 199.9, quantidade: 1 },
    { nome: "Cabo USB-C", preco: 30.0, quantidade: 2 }
  ],
  total: 259.9,
  data: new Date(),
  status: "entregue"
});
print("9.2a: Pedido com modelo EMBED inserido.");

// b) Modelo REFERENCIADO (usando _id real)
const produtoRef = db.products.findOne({ nome: "Televisor" });
if (produtoRef) {
  db.orders.insertOne({
    usuario_id: 2,
    usuario_email: "eduardo@exemplo.com",
    items: [{ productId: produtoRef._id, qty: 1 }],
    total: 2500,
    status: "completo",
    data: new Date(),
    pontos_fidelidade_gerados: 250
  });
  print("9.2b: Pedido com modelo REFERENCIADO inserido.");
} else {
  print("9.2b: Produto 'Televisor' não encontrado. Pedido referenciado NÃO inserido.");
}

// EXPLAIN com $lookup (só se houver pedidos com productId)
const refOrder = db.orders.findOne({ "items.productId": { $exists: true } });
if (refOrder) {
  print("\n9.2 EXPLAIN: Consulta com $lookup em modelo referenciado");
  printjson(
    db.orders.aggregate([
      { $match: { "items.productId": { $exists: true } } },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.productId",
          foreignField: "_id",
          as: "product"
        }
      },
      { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
      { $project: { "product.nome": 1, "items.qty": 1 } }
    ]).explain("executionStats")
  );
} else {
  print("\n9.2: Nenhum pedido com 'productId' encontrado. EXPLAIN de referência pulado.");
}

// ---------------- 9.3 Índices e análise de performance ----------------
print("\n9.3 EXPLAIN: Consulta otimizada com índice composto");
printjson(
  db.orders
    .find({ usuario_id: 1 })
    .sort({ data: -1 })
    .limit(5)
    .explain("executionStats")
);

// ---------------- 9.4 Estratégias de Sharding (simulação) ----------------
print("\n9.4 Estratégia de Sharding — conceito e exemplo");
db.products.createIndex({ vendedor: 1 });
print("Índice em 'vendedor' criado para sharding.");
print("\nComandos teóricos de sharding:");
print("sh.enableSharding('marketplace');");
print("sh.shardCollection('marketplace.products', { vendedor: 'hashed' });");

// ---------------- Pipeline com $facet (ajustado para schema real) ----------------
print("\n9.5 Pipeline avançado com $facet (schema real)");

// NOTA: Seu schema NÃO usa _id em relações, então este pipeline é simbólico.
// Para funcionalidade real, seria necessário reestruturar.
print("AVISO: Pipeline $facet mantido como exemplo conceitual (não funcional com schema atual).");
printjson({ 
  message: "Use productName e vendedor (email) para relações reais.",
  suggestion: "Reestruture orders para usar productId se quiser $lookup eficiente."
});
