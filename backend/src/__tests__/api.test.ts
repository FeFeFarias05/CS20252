import request from 'supertest';

const API_BASE = process.env.TEST_API_BASE || 'http://localhost:3000';

test('GET /api/pets should return all pets', async () => {
  const res = await request(API_BASE).get('/api/pets');
  expect([200, 204]).toContain(res.status);
  if (res.status === 200) {
    expect(Array.isArray(res.body)).toBe(true);
  }
});

test('POST /api/pets should create a new pet', async () => {
  const newPet = {
    nome: 'Rex',
    foto: 'https://example.com/rex.jpg',
    idade: 3,
    raca: 'Labrador',
    peso: 25.5,
    medicacoes: 'Nenhuma',
    informacoes: 'Cachorro amigável',
  };

  const res = await request(API_BASE)
    .post('/api/pets')
    .send(newPet);
  
  expect(res.status).toBe(201);
  expect(res.body).toHaveProperty('petId');
  expect(res.body.nome).toBe(newPet.nome);
  expect(res.body.raca).toBe(newPet.raca);
});

test('POST /api/pets should return 400 for missing required fields', async () => {
  const invalidPet = {
    nome: 'Rex',
  };

  const res = await request(API_BASE)
    .post('/api/pets')
    .send(invalidPet);
  
  expect(res.status).toBe(400);
});
