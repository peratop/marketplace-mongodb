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

// Select the database to use.
use('marketplace');

//Auto increment
db.counters.updateOne(
  { _id: "userId" },
  { $setOnInsert: { seq: 0 } },
  { upsert: true }
);

function getNextSequenceValue(sequenceName) {
  const result = db.counters.findOneAndUpdate(
    { _id: sequenceName },
    { $inc: { seq: 1 } },
    { returnNewDocument: true, upsert: true }
  );

  if (!result) {
    throw new Error("Erro ao gerar sequência: contador não encontrado.");
  }

  const seqValue = result.value ? result.value.seq : result.seq;
  return seqValue;
}




// --------------- 1) Modelo (DER / UML - resumo) -----------------
// ENTIDADES PRINCIPAIS:
// Users: { _id, name, email, password, address, location: { type: "Point", coordinates: [lng, lat] }, loyaltyPoints }
// Products: { _id, sellerId (ref users), name, description, price, quantity, location, categoryId, promotions: [ {discount, start, end} ] }
// Categories: { _id, name, parentId (self-ref) }
// Transactions: { _id, buyerId, sellerId, items: [ {productId, qty, priceAtPurchase} ], status, date, loyaltyPointsEarned }
// Reviews: { _id, productId, buyerId, sellerId, rating, text, date, response: { sellerId, text, date } }
// Decisões de modelagem:
// - Users e Products em collections separadas. Seller referenciado por ObjectId (higly reused).
// - Reviews: armazenar por coleção própria (referência para product + buyer). Pode embutir resposta do vendedor.
// - Transactions: coleção própria; items array (embed) porque pertence à transação.

// ---------------- 2) Criação das collections com validação JSON Schema ----------------

// Drop para recomeçar durante testes
db.users.drop();
db.products.drop();
db.categories.drop();
db.transactions.drop();
db.reviews.drop();

// Users
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
            type: { enum: ['Point'] },
            coordinates: { bsonType: 'array', minItems: 2, maxItems: 2 }
          }
        },
        pontos_fidelidade: { bsonType: 'int', minimum: 0 }
      }
    }
  }
});

// Categories (mantive simples)
db.createCollection('categories', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name'],
      properties: { name: { bsonType: 'string' }, parentId: { bsonType: 'objectId' } }
    }
  }
});

// Products (schema compatível com os inserts em português)
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
        localizacao: { bsonType: 'string' },
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
        vendedor: { bsonType: 'string', pattern: '^.+@.+\\..+$' } // email do vendedor conforme inserts
      }
    }
  }
});

// Orders (substitui a antiga transactions para manter compatibilidade com os inserts existentes)
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

// Reviews (compatível com os inserts)
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

// ---------------- Inserts corrigidos ----------------

// USERS (IDs numéricos gerados via contador)
db.getCollection('users').insertMany([
  {
    _id: getNextSequenceValue("userId"),
    nome: "Ana Silva",
    email: "ana@example.com",
    senha: "REPLACE_WITH_HASHED_PASSWORD",
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
    senha: "REPLACE_WITH_HASHED_PASSWORD",
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
    senha: "REPLACE_WITH_HASHED_PASSWORD",
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
    senha: "REPLACE_WITH_HASHED_PASSWORD",
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
    senha: "REPLACE_WITH_HASHED_PASSWORD",
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
    senha: "REPLACE_WITH_HASHED_PASSWORD",
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

// PRODUCTS (mantive campos em português conforme seus inserts)
db.getCollection('products').insertMany([
  {
    nome: "Fone sem fio",
    descricao: "Fone bluetooth sem fio, bateria de longa duração.",
    preco: { valor: 199.9, moeda: "BRL" },
    quantidade_disponivel: 10,
    localizacao: "São Paulo",
    categoria: "eletrônicos",
    promocoes_ativas: [],
    vendedor: "ana@example.com"
  },
  {
    nome: "Televisor",
    descricao: "Televisor LED 55'' com resolução 4K.",
    preco: { valor: 2500, moeda: "BRL" },
    quantidade_disponivel: 5,
    localizacao: "Rio de Janeiro",
    categoria: "eletrônicos",
    promocoes_ativas: [],
    vendedor: "eduardo@exemplo.com"
  },
  {
    nome: "É Jordão",
    descricao: "Item variado / colecionável (descrição original preservada no título).",
    preco: { valor: 822.8, moeda: "BRL" },
    quantidade_disponivel: 3,
    localizacao: "Minas Gerais",
    categoria: "colecionáveis",
    promocoes_ativas: [],
    vendedor: "leonardo@exemplo.com"
  },
  {
    nome: "Adidas Sambódromo",
    descricao: "Tênis / calçado Adidas edição Sambódromo.",
    preco: { valor: 456.4, moeda: "BRL" },
    quantidade_disponivel: 20,
    localizacao: "Paraná",
    categoria: "vestuário",
    promocoes_ativas: [],
    vendedor: "Thousand@exemplo.com"
  },
  {
    nome: "Regata Minnesotta Timberwolves City Edition 2025/26",
    descricao: "Regata oficial Timberwolves - edição City 2025/26.",
    preco: { valor: 380, moeda: "BRL" },
    quantidade_disponivel: 15,
    localizacao: "Rio Grande do Sul",
    categoria: "vestuário",
    promocoes_ativas: [],
    vendedor: "jondoe@exemplo.com"
  },
  {
    nome: "Camisa Crontias Total 80",
    descricao: "Camisa esportiva - coleção Total 80.",
    preco: { valor: 49, moeda: "BRL" },
    quantidade_disponivel: 50,
    localizacao: "Bahia",
    categoria: "vestuário",
    promocoes_ativas: [],
    vendedor: "dudeperson@exemplo.com"
  },
  {
    nome: "Bola Brazuka copa 2014 (mto raro)",
    descricao: "Bola da Copa 2014 - item de colecionador, muito rara.",
    preco: { valor: 900000, moeda: "BRL" },
    quantidade_disponivel: 1,
    localizacao: "São Paulo",
    categoria: "colecionáveis",
    promocoes_ativas: [],
    vendedor: "ana@example.com"
  },
  {
    nome: "A famosa jabulani copa 2010 (mais raro ainda)",
    descricao: "Jabulani 2010 - peça de colecionador, extremamente rara.",
    preco: { valor: 10000000, moeda: "USD" },
    quantidade_disponivel: 1,
    localizacao: "Rio de Janeiro",
    categoria: "colecionáveis",
    promocoes_ativas: [],
    vendedor: "eduardo@exemplo.com"
  },
  {
    nome: "Sacola plástica 40x90mm",
    descricao: "SACOLA plástica resistente 40x90mm (pacote).",
    preco: { valor: 49, moeda: "BRL" },
    quantidade_disponivel: 200,
    localizacao: "Minas Gerais",
    categoria: "embalagem",
    promocoes_ativas: [],
    vendedor: "leonardo@exemplo.com"
  },
  {
    nome: "Caixa de papelão 250x80x190mm",
    descricao: "Caixa de papelão para transporte e armazenamento.",
    preco: { valor: 60, moeda: "BRL" },
    quantidade_disponivel: 120,
    localizacao: "Paraná",
    categoria: "embalagem",
    promocoes_ativas: [],
    vendedor: "Thousand@exemplo.com"
  },
  {
    nome: "Carro pika",
    descricao: "Veículo usado - descrição breve preservada no título.",
    preco: { valor: 9000000, moeda: "BRL" },
    quantidade_disponivel: 1,
    localizacao: "Rio Grande do Sul",
    categoria: "veículos",
    promocoes_ativas: [],
    vendedor: "jondoe@exemplo.com"
  },
  {
    nome: "Celta 2012",
    descricao: "Celta ano 2012, usado.",
    preco: { valor: 4500, moeda: "BRL" },
    quantidade_disponivel: 1,
    localizacao: "Bahia",
    categoria: "veículos",
    promocoes_ativas: [],
    vendedor: "dudeperson@exemplo.com"
  }
]);

// ORDERS (substituí userId indefinido por ids corretos 1..6)
db.getCollection('orders').insertMany([
  {
    usuario_id: 1,
    usuario_email: "ana@example.com",
    items: [{ product: "Fone sem fio", qty: 1 }],
    total: 199.9,
    status: "completo",
    data: new Date("2025-10-01T10:15:00.000Z"),
    pontos_fidelidade_gerados: 19
  },
  {
    usuario_id: 2,
    usuario_email: "eduardo@exemplo.com",
    items: [{ product: "Televisor", qty: 1 }],
    total: 2500,
    status: "em trânsito",
    data: new Date("2025-09-20T14:30:00.000Z"),
    pontos_fidelidade_gerados: 250
  },
  {
    usuario_id: 3,
    usuario_email: "leonardo@exemplo.com",
    items: [{ product: "É Jordão", qty: 2 }],
    total: 1645.6,
    status: "completo",
    data: new Date("2025-10-10T09:00:00.000Z"),
    pontos_fidelidade_gerados: 164
  },
  {
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
    usuario_id: 5,
    usuario_email: "jondoe@exemplo.com",
    items: [{ product: "Caixa de papelão 250x80x190mm", qty: 5 }],
    total: 300,
    status: "completo",
    data: new Date("2025-10-05T11:20:00.000Z"),
    pontos_fidelidade_gerados: 30
  },
  {
    usuario_id: 6,
    usuario_email: "dudeperson@exemplo.com",
    items: [{ product: "Celta 2012", qty: 1 }],
    total: 4500,
    status: "pendente",
    data: new Date("2025-10-25T08:00:00.000Z"),
    pontos_fidelidade_gerados: 450
  },
  {
    usuario_id: 1,
    usuario_email: "ana@example.com",
    items: [{ product: "Adidas Sambódromo", qty: 2 }],
    total: 912.8,
    status: "completo",
    data: new Date("2025-09-30T12:00:00.000Z"),
    pontos_fidelidade_gerados: 91
  },
  {
    usuario_id: 2,
    usuario_email: "eduardo@exemplo.com",
    items: [{ product: "A famosa jabulani copa 2010 (mais raro ainda)", qty: 1 }],
    total: 10000000,
    status: "completo",
    data: new Date("2025-07-01T07:30:00.000Z"),
    pontos_fidelidade_gerados: 1000000
  },
  {
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

// REVIEWS (substituí userId indefinido por ids válidos e usei Date)
db.getCollection('reviews').insertMany([
  {
    userId: 1,
    productName: "Fone sem fio",
    rating: 5,
    comment: "Ótimo fone, bateria dura muito!",
    date: new Date("2025-10-26")
  },
  {
    userId: 2,
    productName: "Televisor",
    rating: 5,
    comment: "Imagem perfeita, recomendo muito",
    date: new Date("2025-10-25")
  },
  {
    userId: 3,
    productName: "É Jordão",
    rating: 4,
    comment: "Tênis muito bom, só achei um pouco caro",
    date: new Date("2025-10-24")
  },
  {
    userId: 4,
    productName: "Regata Minnesotta Timberwolves City Edition 2025/26",
    rating: 5,
    comment: "me sinto o ja morant <3",
    date: new Date("2025-10-24")
  },
  {
    userId: 5,
    productName: "Camisa Crontias Total 80",
    rating: 5,
    comment: "nostalgia pura, meu pai torcia para o crontias em 507 d.C, quando vencemos Tenochtitlán",
    date: new Date("2025-10-24")
  },
  {
    userId: 3,
    productName: "Caixa de papelão 250x80x190mm",
    rating: 4,
    comment: "Caixas resistentes, cumprem o prometido",
    date: new Date("2025-10-23")
  },
  {
    userId: 6,
    productName: "Celta 2012",
    rating: 3,
    comment: "Carro econômico, motor bom, só precisa de uma regulagem",
    date: new Date("2025-10-22")
  },
  {
    userId: 4,
    productName: "Adidas Sambódromo",
    rating: 5,
    comment: "Tênis lindo demais, super confortável, faltou uma listra",
    date: new Date("2025-10-21")
  },
  {
    userId: 2,
    productName: "A famosa jabulani copa 2010 (mais raro ainda)",
    rating: 1,
    comment: "a bola era falsa :(",
    date: new Date("2025-10-20")
  },
  {
    userId: 2,
    productName: "Televisor",
    rating: 2,
    comment: "Segunda TV que compro dessa marca, mas infelizmente nenhuma funciona",
    date: new Date("2025-10-19")
  },
  {
    userId: 1,
    productName: "Fone sem fio",
    rating: 4,
    comment: "Muito bom, mas a conexão às vezes falha",
    date: new Date("2025-10-19")
  },
  {
    userId: 3,
    productName: "Caixa de papelão 250x80x190mm",
    rating: 5,
    comment: "Ótimas para organização, muito resistentes",
    date: new Date("2025-10-18")
  },
  {
    userId: 3,
    productName: "Sacola plástica 40x90mm",
    rating: 4,
    comment: "Boas sacolas, resistentes e práticas",
    date: new Date("2025-10-18")
  }
]);

// ---------------- 4) Índices recomendados e criação ----------------
// Justificativa resumo:
// - products: index em categoryId (buscas por categoria) + text index em name/description se pesquisa full-text
// - products: geospatial 2dsphere em location (para buscas por proximidade)
// - transactions: index em sellerId, buyerId, date (relatórios por vendedor e temporal)
// - reviews: index em productId para busca rápida de avaliações
// - users: index em email (login único)

// Criação de índices:
db.products.createIndex({ categoryId: 1 });
db.products.createIndex({ name: 'text', description: 'text' });
db.products.createIndex({ location: '2dsphere' });

db.transactions.createIndex({ sellerId: 1, date: -1 });
db.transactions.createIndex({ buyerId: 1, date: -1 });

db.reviews.createIndex({ productId: 1 });
db.users.createIndex({ email: 1 }, { unique: true });

// ---------------- 5) Consultas Básicas ----------------

// 5.1 Encontrar todos os produtos de uma categoria específica (use _id de categoria)
// exemplo: produtos da categoria 'Eletrônicos'
const eletrônicos = db.products.find({ categoryId: catIds[0] }).toArray();
print('Produtos Eletrônicos:', JSON.stringify(eletrônicos, null, 2));

// 5.2 Buscar todas as avaliações de um produto
const productReviews = db.reviews.find({ productId: prodRes[0] }).toArray();
print('Avaliações do produto:', JSON.stringify(productReviews, null, 2));

// 5.3 Criar uma nova transação (compra) -> também atualizar estoque e pontos (transação lógica: use session/transaction em replica set)
// Aqui um exemplo simples sem transação (no Playground, para replicaset usar session.startTransaction())
function createPurchase(buyerId, productId, qty){
  const product = db.products.findOne({_id: productId});
  if(!product || product.quantity < qty) throw 'Estoque insuficiente';
  const sellerId = product.sellerId;
  const price = product.price;
  const loyalty = Math.floor(price * qty * 0.01); // 1% como exemplo
  const trans = db.transactions.insertOne({ buyerId, sellerId, items:[{productId, qty, priceAtPurchase: price}], status:'PAID', date:new Date(), loyaltyPointsEarned: loyalty });
  // atualizar estoque
  db.products.updateOne({_id: productId}, {$inc: {quantity: -qty}});
  // creditar pontos no usuário comprador
  db.users.updateOne({_id: buyerId}, {$inc: {loyaltyPoints: loyalty}});
  return trans.insertedId;
}
// Exemplo de uso (comentado pois usa variáveis criadas acima):
// const newTransId = createPurchase(userRes[1], prodRes[4], 1);

// 5.4 Atualizar quantidade de produto após uma compra (separado):
db.products.updateOne({_id: prodRes[4]}, {$inc: {quantity: -1}});

// ---------------- 6) Agregações ----------------

// 6.1 Calcular a média de avaliação por produto
const avgRatingPerProduct = db.reviews.aggregate([
  { $group: { _id: '$productId', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
  { $unwind: '$product' },
  { $project: { productName: '$product.name', avgRating: 1, count:1 } }
]).toArray();
print('Média de avaliação por produto:', JSON.stringify(avgRatingPerProduct, null, 2));

// 6.2 Calcular o total de vendas por categoria
// pipeline: unwind items -> lookup product -> group by categoryId
const salesByCategory = db.transactions.aggregate([
  { $unwind: '$items' },
  { $lookup: { from: 'products', localField: 'items.productId', foreignField: '_id', as: 'product' } },
  { $unwind: '$product' },
  { $group: { _id: '$product.categoryId', totalRevenue: { $sum: { $multiply: ['$items.qty','$items.priceAtPurchase'] } }, totalQty: { $sum: '$items.qty' } } },
  { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
  { $unwind: '$category' },
  { $project: { categoryName: '$category.name', totalRevenue:1, totalQty:1 } }
]).toArray();
print('Vendas por categoria:', JSON.stringify(salesByCategory, null, 2));

// 6.3 Relatórios de vendas por vendedor (quantidade vendida e receita total)
const salesBySeller = db.transactions.aggregate([
  { $unwind: '$items' },
  { $group: { _id: '$sellerId', revenue: { $sum: { $multiply:['$items.qty','$items.priceAtPurchase'] } }, qtySold: { $sum: '$items.qty' } } },
  { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'seller' } },
  { $unwind: '$seller' },
  { $project: { sellerName: '$seller.name', revenue:1, qtySold:1 } }
]).toArray();
print('Vendas por vendedor:', JSON.stringify(salesBySeller, null, 2));

// ---------------- 7) Sprint 2: Novos requisitos e migrações ----------------
// Requisitos: promoções temporárias (já previsto), pontos fidelidade (users.loyaltyPoints), respostas a avaliações (reviews.response), geolocalização (already added)

// 7.1 Adicionar um campo de promoções a um produto (exemplo de update)
// inserir promoção num produto
db.products.updateOne({_id: prodRes[1]}, {$push: { promotions: { discount: 0.1, start: new Date('2025-11-10'), end: new Date('2025-11-20') } }});

// 7.2 Backfill: garantir que todos os usuários tenham loyaltyPoints (se campo ausente)
db.users.updateMany({ loyaltyPoints: { $exists: false } }, { $set: { loyaltyPoints: 0 } });

// 7.3 Resposta a review (vendedor responde)
db.reviews.updateOne({_id: db.reviews.findOne({productId: prodRes[0]})._id}, { $set: { response: { sellerId: userRes[0], text: 'Obrigado pelo feedback!', date: new Date() } } });

// 7.4 Geolocation: já adicionamos location nos users e products. Criar índice 2dsphere (feito acima)

// ---------------- 8) Consultas Avançadas (geospatial + análises) ----------------

// 8.1 Buscar produtos próximos ao usuário dentro de um raio X (metros)
function findProductsNear(userId, radiusMeters){
  const user = db.users.findOne({_id: userId});
  if(!user || !user.location) return [];
  return db.products.find({ location: { $near: { $geometry: user.location, $maxDistance: radiusMeters } } }).toArray();
}
// exemplo: produtos dentro de 50km (50000m) do userRes[0]
const nearby = findProductsNear(userRes[0], 50000);
print('Produtos próximos:', JSON.stringify(nearby, null, 2));

// 8.2 Calcular a média de distância entre compradores e vendedores para transações concluídas
// aproximação usando $geoNear requires index and starts pipeline; se não disponível, calculamos haversine no client. Exemplo $geoNear pipeline:
const avgDistance = db.transactions.aggregate([
  { $match: { status: 'DELIVERED' } },
  { $unwind: '$items' },
  { $lookup: { from: 'users', localField: 'buyerId', foreignField: '_id', as: 'buyer' } },
  { $unwind: '$buyer' },
  { $lookup: { from: 'users', localField: 'sellerId', foreignField: '_id', as: 'seller' } },
  { $unwind: '$seller' },
  { $project: { distance: { $let: { vars: { 
        lat1: { $arrayElemAt: ['$buyer.location.coordinates',1] }, lng1: { $arrayElemAt: ['$buyer.location.coordinates',0] },
        lat2: { $arrayElemAt: ['$seller.location.coordinates',1] }, lng2: { $arrayElemAt: ['$seller.location.coordinates',0] }
      }, in: { $multiply: [111195, { $sqrt: { $add: [ { $pow: [{ $subtract: ['$$lat1','$$lat2'] }, 2] }, { $pow: [{ $subtract: ['$$lng1','$$lng2'] }, 2] } ] } } ] } } } } },
  { $group: { _id: null, avgDistanceMeters: { $avg: '$distance' } } }
]).toArray();
print('Distância média (m):', JSON.stringify(avgDistance, null, 2));

// 8.3 Encontrar a categoria de produto mais vendida em uma área geográfica específica
// Defina uma bbox ou use $geoWithin com um circle (padrões podem variar). Exemplo usando $geoWithin com $centerSphere (radius em radianos)
function mostSoldCategoryInArea(centerLng, centerLat, radiusMeters){
  const earthRadius = 6378137; // metros
  const radiusInRadians = radiusMeters / earthRadius;
  return db.transactions.aggregate([
    { $unwind: '$items' },
    { $lookup: { from: 'products', localField: 'items.productId', foreignField: '_id', as: 'product' } },
    { $unwind: '$product' },
    { $match: { 'product.location': { $geoWithin: { $centerSphere: [ [ centerLng, centerLat ], radiusInRadians ] } } } },
    { $group: { _id: '$product.categoryId', totalQty: { $sum: '$items.qty' } } },
    { $sort: { totalQty: -1 } },
    { $limit: 1 },
    { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
    { $unwind: '$category' },
    { $project: { categoryName: '$category.name', totalQty:1 } }
  ]).toArray();
}

// Exemplo de uso (50km em torno de Curitiba coordenadas do userRes[0])
const mostSold = mostSoldCategoryInArea(-49.2733, -25.4278, 50000);
print('Categoria mais vendida na área:', JSON.stringify(mostSold, null, 2));

// ---------------- 9) Tópicos Complementares de Performance ----------------

// 9.1 explain() para uma query: exemplo de explain em uma busca por categoria
printjson(db.products.find({ categoryId: catIds[0] }).explain('executionStats'));

// 9.2 Comparação embed vs ref (exemplo conceitual):
// - Embed (ex: items dentro de transaction) => leitura de transação única é rápida, menos joins.
// - Reference (ex: product details em transaction por productId) => evita duplicação e mantém dados atualizáveis, porém requer $lookup em relatórios.
// Para cargas de leitura heavy em transações, considerar copiar campos essenciais (nome, priceAtPurchase) para o documento de transaction (design denormalizado) e manter referência para productId.

// 9.3 Análise de performance com explain() e índices: use explain('executionStats') nas queries que você quiser otimizar.

// 9.4 Estratégias de Sharding (conceito + exemplo de comando):
// - Chave de shard: escolha uma chave com alta cardinalidade e que distribua a carga (ex: sellerId ou hash de productId) dependendo do padrão de consultas.
// - Exemplo (apenas se cluster sharded estiver disponível):
// sh.enableSharding('marketplace');
// db.products.createIndex({ sellerId: 1, _id: 1 });
// sh.shardCollection('marketplace.products', { sellerId: 'hashed' });
// Observação: testar em ambiente simulado e medir antes de migrar.

// ---------------- FIM ----------------

// Recomendações para apresentação:
// - Mostre explain() antes/depois de criar índices
// - Demonstre 1 exemplo de migração de dados (backfill) e seu script
// - Prepare gráficos (opcional) com resultados de tempo de execução das queries

print('Script finalizado. Revise outputs acima no Playground.');




