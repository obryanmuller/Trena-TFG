import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createDb } from '../server/db.mjs';
import { createApp } from '../server/app.mjs';

const image =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=';
const service = {
  title: 'Pintura de uma sala',
  description: 'Preparar as paredes e pintar uma sala de 25 metros quadrados.',
  category: 'Pintura',
  city: 'Itajubá, MG',
  budget: 1800,
  deadline: new Date(Date.now() + 86400000 * 10).toISOString().slice(0, 10),
  images: [image],
};
async function setup(t, options = {}) {
  const db = createDb(':memory:', true);
  const server = createApp(db, options).listen(0, '127.0.0.1');
  await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}`;
  t.after(async () => {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
    db.close();
  });
  async function req(path, method = 'GET', body, cookie = '', headers = {}) {
    const r = await fetch(base + '/api' + path, {
      method,
      headers: { 'Content-Type': 'application/json', cookie, ...headers },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return {
      status: r.status,
      data: await r.json(),
      cookie: r.headers.get('set-cookie')?.split(';')[0],
    };
  }
  const client = await req('/auth/login', 'POST', {
    email: 'cliente@trena.demo',
    password: 'Trena@2026',
  });
  const pro = await req('/auth/login', 'POST', {
    email: 'profissional@trena.demo',
    password: 'Trena@2026',
  });
  return { req, db, client: client.cookie, pro: pro.cookie };
}

test('cadastro dos dois papéis, login, privacidade, senha protegida e encerramento da sessão', async (t) => {
  const { req, db } = await setup(t);
  const input = {
    name: 'Cliente de teste',
    email: 'novo@example.com',
    password: 'SenhaForte123',
    city: 'Itajubá, MG',
    role: 'client',
  };
  const result = await req('/auth/register', 'POST', input);
  assert.equal(result.status, 201);
  assert.ok(result.cookie);
  assert.equal(result.data.user.password, undefined);
  assert.notEqual(
    db.prepare('SELECT password FROM users WHERE email=?').get(input.email).password,
    input.password,
  );
  assert.equal((await req('/auth/me', 'GET', undefined, result.cookie)).data.user.name, input.name);
  assert.equal((await req('/auth/register', 'POST', input)).status, 409);
  assert.equal(
    (await req('/auth/login', 'POST', { email: input.email, password: 'incorreta' })).status,
    401,
  );
  assert.equal((await req('/auth/logout', 'POST', {}, result.cookie)).status, 200);
  assert.equal((await req('/auth/me', 'GET', undefined, result.cookie)).data.user, null);
  const professional = await req('/auth/register', 'POST', {
    ...input,
    email: 'pro@example.com',
    role: 'professional',
    specialty: 'Pintura',
    bio: 'Pintura de interiores',
  });
  assert.equal(professional.status, 201);
  const publicData = await req('/professionals');
  assert.ok(publicData.data.some((p) => p.id === professional.data.user.id));
  assert.ok(publicData.data.every((p) => !('email' in p) && !('password' in p)));
});
test('fluxo integrado: anúncio com imagem, interesse, chat, contratação, conclusão e avaliação', async (t) => {
  const { req, client, pro } = await setup(t);
  const posted = await req('/services', 'POST', service, client);
  assert.equal(posted.status, 201);
  const id = posted.data.id;
  assert.equal((await req('/services')).data.find((s) => s.id === id).images[0], image);
  const interest = await req(`/services/${id}/interest`, 'POST', {}, pro);
  assert.equal(interest.status, 200);
  const chat = interest.data.conversation;
  assert.equal((await req(`/services/${id}/interest`, 'POST', {}, pro)).data.conversation, chat);
  assert.equal(
    (
      await req(
        `/conversations/${chat}/messages`,
        'POST',
        { text: 'Podemos combinar uma visita?', image },
        pro,
      )
    ).status,
    201,
  );
  const messages = await req(`/conversations/${chat}/messages`, 'GET', undefined, client);
  assert.equal(messages.data[0].text, 'Podemos combinar uma visita?');
  assert.equal(messages.data[0].image, image);
  assert.equal(
    (await req(`/services/${id}/reviews`, 'POST', { rating: 5, comment: 'Ótimo serviço.' }, client))
      .status,
    403,
  );
  assert.equal(
    (
      await req(
        `/services/${id}/status`,
        'PATCH',
        { status: 'active', professional_id: 'demo-pro' },
        client,
      )
    ).status,
    200,
  );
  assert.ok(!(await req('/services')).data.some((s) => s.id === id));
  assert.equal(
    (
      await req(
        `/services/${id}/status`,
        'PATCH',
        { status: 'completed', closure_reason: 'Entrega concluída conforme combinado.' },
        client,
      )
    ).status,
    200,
  );
  assert.equal(
    (
      await req(
        `/services/${id}/reviews`,
        'POST',
        { rating: 5, comment: 'Ótimo serviço, comunicação clara e entrega no prazo.' },
        client,
      )
    ).status,
    201,
  );
  const profile = await req('/professionals/demo-pro');
  assert.equal(profile.data.rating, 4.85);
  assert.equal(profile.data.review_count, 2);
  assert.equal(
    profile.data.completed_services.find((service) => service.id === 'demo-completed-1')
      .review_rating,
    4.7,
  );
  assert.equal(
    (
      await req(
        `/services/${id}/reviews`,
        'POST',
        { rating: 4, comment: 'Tentativa de duplicação.' },
        client,
      )
    ).status,
    409,
  );
  assert.equal(
    (await req('/services?mine=1', 'GET', undefined, client)).data.find((s) => s.id === id)
      .review_rating,
    5,
  );
});
test('contratação direta cria serviço privado e conversa sem anúncio público', async (t) => {
  const { req, client, pro } = await setup(t);
  const result = await req(
    '/services',
    'POST',
    { ...service, professional_id: 'demo-pro' },
    client,
  );
  assert.equal(result.status, 201);
  assert.ok(result.data.conversation);
  assert.ok(!(await req('/services')).data.some((s) => s.id === result.data.id));
  assert.ok(
    (await req('/services?mine=1', 'GET', undefined, pro)).data.some(
      (s) => s.id === result.data.id,
    ),
  );
  assert.equal(
    (await req(`/conversations/${result.data.conversation}/messages`, 'GET', undefined, pro))
      .status,
    200,
  );
});
test('autorização impede publicar como profissional, ler chat alheio e alterar serviço de outro cliente', async (t) => {
  const { req, client, pro } = await setup(t);
  assert.equal((await req('/services', 'POST', service)).status, 401);
  assert.equal((await req('/services', 'POST', service, pro)).status, 403);
  const result = await req(
    '/services',
    'POST',
    { ...service, professional_id: 'demo-pro' },
    client,
  );
  const other = await req('/auth/register', 'POST', {
    name: 'Outra Pessoa',
    email: 'outro@example.com',
    password: 'Senha1234',
    role: 'client',
    city: 'Itajubá, MG',
  });
  assert.equal(
    (
      await req(
        `/conversations/${result.data.conversation}/messages`,
        'GET',
        undefined,
        other.cookie,
      )
    ).status,
    404,
  );
  assert.equal(
    (
      await req(
        `/conversations/${result.data.conversation}/messages`,
        'POST',
        { text: 'Intrusão' },
        other.cookie,
      )
    ).status,
    404,
  );
  assert.equal(
    (
      await req(
        `/services/${result.data.id}/status`,
        'PATCH',
        { status: 'active', professional_id: 'demo-pro' },
        other.cookie,
      )
    ).status,
    404,
  );
  assert.equal(
    (
      await req(
        `/services/${result.data.id}/status`,
        'PATCH',
        { status: 'active', professional_id: 'demo-pro' },
        pro,
      )
    ).status,
    403,
  );
  assert.equal((await req('/services?mine=1', 'GET', undefined, other.cookie)).data.length, 0);
});
test('validações rejeitam orçamento, prazo, categoria e imagens inválidas', async (t) => {
  const { req, client } = await setup(t);
  for (const invalid of [
    { budget: -1 },
    { budget: 'abc' },
    { budget: 0 },
    { deadline: '2020-01-01' },
    { deadline: '2030-02-31' },
    { category: 'Inexistente' },
    { description: 'Curta' },
    { images: ['https://example.com/image.png'] },
    { images: ['data:image/png;base64,YWJjZA=='] },
    { images: Array(7).fill(image) },
  ])
    assert.equal(
      (await req('/services', 'POST', { ...service, ...invalid }, client)).status,
      400,
      JSON.stringify(invalid),
    );
  const result = await req('/services', 'POST', service, client);
  assert.equal(
    (
      await req(
        `/services/${result.data.id}/status`,
        'PATCH',
        { status: 'completed', closure_reason: 'Entrega concluída conforme combinado.' },
        client,
      )
    ).status,
    409,
  );
});
test('perfil persiste portfólio e notificações são específicas do destinatário', async (t) => {
  const { req, client, pro } = await setup(t);
  const profile = await req(
    '/profile',
    'PATCH',
    {
      name: 'Carlos Oliveira',
      city: 'Itajubá, MG',
      specialty: 'Alvenaria',
      bio: 'Nova descrição profissional.',
      portfolio: [image],
    },
    pro,
  );
  assert.equal(profile.status, 200);
  assert.equal((await req('/professionals/demo-pro')).data.portfolio[0], image);
  const result = await req(
    '/services',
    'POST',
    { ...service, professional_id: 'demo-pro' },
    client,
  );
  assert.ok(
    (await req('/notifications', 'GET', undefined, pro)).data.some(
      (n) => n.conversation_id === result.data.conversation && !n.is_read,
    ),
  );
  assert.equal((await req('/notifications', 'GET', undefined, client)).data.length, 0);
  await req('/notifications/read', 'PATCH', {}, pro);
  assert.ok(
    (await req('/notifications', 'GET', undefined, pro)).data.every((n) => n.is_read === 1),
  );
});
test('origem externa é bloqueada e sessão expirada perde acesso', async (t) => {
  const { req, db, client } = await setup(t);
  assert.equal(
    (await req('/services', 'POST', service, client, { Origin: 'https://evil.example' })).status,
    403,
  );
  db.prepare('UPDATE sessions SET expires=0').run();
  assert.equal((await req('/notifications', 'GET', undefined, client)).status, 401);
});
test('não se contrata profissional sem negociação nem se reabre serviço concluído', async (t) => {
  const { req, client, pro } = await setup(t);
  const result = await req('/services', 'POST', service, client);
  const id = result.data.id;
  assert.equal(
    (
      await req(
        `/services/${id}/status`,
        'PATCH',
        { status: 'active', professional_id: 'demo-pro' },
        client,
      )
    ).status,
    409,
  );
  await req(`/services/${id}/interest`, 'POST', {}, pro);
  assert.equal(
    (
      await req(
        `/services/${id}/status`,
        'PATCH',
        { status: 'active', professional_id: 'demo-painter' },
        client,
      )
    ).status,
    400,
  );
  await req(
    `/services/${id}/status`,
    'PATCH',
    { status: 'active', professional_id: 'demo-pro' },
    client,
  );
  await req(
    `/services/${id}/status`,
    'PATCH',
    { status: 'completed', closure_reason: 'Entrega concluída conforme combinado.' },
    client,
  );
  assert.equal(
    (await req(`/services/${id}/status`, 'PATCH', { status: 'open' }, client)).status,
    409,
  );
  assert.equal(
    (await req(`/services/${id}/reviews`, 'POST', { rating: 6, comment: 'Nota inválida.' }, client))
      .status,
    400,
  );
});

test('cliente encerra serviço ativo como concluído, pausado ou não concluído', async (t) => {
  const { req, client, pro } = await setup(t);

  async function activeService(title) {
    const result = await req('/services', 'POST', { ...service, title }, client);
    await req(`/services/${result.data.id}/interest`, 'POST', {}, pro);
    await req(
      `/services/${result.data.id}/status`,
      'PATCH',
      { status: 'active', professional_id: 'demo-pro' },
      client,
    );
    return result.data.id;
  }

  const completed = await activeService('Serviço com fotos finais');
  assert.equal(
    (
      await req(
        `/services/${completed}/status`,
        'PATCH',
        {
          status: 'completed',
          completion_images: [image],
          closure_reason: 'Entrega feita com acabamento revisado e limpeza final.',
          rating: 4.7,
        },
        client,
      )
    ).status,
    200,
  );
  const completedService = (await req('/services?mine=1', 'GET', undefined, client)).data.find(
    (item) => item.id === completed,
  );
  assert.equal(completedService.status, 'completed');
  assert.equal(completedService.completion_images.length, 1);
  assert.equal(
    completedService.closure_reason,
    'Entrega feita com acabamento revisado e limpeza final.',
  );
  assert.equal(completedService.review_rating, 4.7);

  const paused = await activeService('Serviço pausado pelo cliente');
  await req(
    `/services/${paused}/status`,
    'PATCH',
    { status: 'paused', closure_reason: 'Aguardando liberação do condomínio.' },
    client,
  );
  const pausedService = (await req('/services?mine=1', 'GET', undefined, client)).data.find(
    (item) => item.id === paused,
  );
  assert.equal(pausedService.status, 'paused');
  assert.equal(pausedService.closure_reason, 'Aguardando liberação do condomínio.');

  const notCompleted = await activeService('Serviço encerrado sem conclusão');
  await req(
    `/services/${notCompleted}/status`,
    'PATCH',
    { status: 'not_completed', closure_reason: 'Escopo cancelado pelo cliente.' },
    client,
  );
  const closedService = (await req('/services?mine=1', 'GET', undefined, client)).data.find(
    (item) => item.id === notCompleted,
  );
  assert.equal(closedService.status, 'not_completed');
  assert.equal(closedService.closure_reason, 'Escopo cancelado pelo cliente.');
  assert.equal(
    (
      await req(
        `/services/${notCompleted}/reviews`,
        'POST',
        { rating: 5, comment: 'Teste.' },
        client,
      )
    ).status,
    403,
  );
});

test('origem de desenvolvimento explícita aceita login e corpos inválidos são rejeitados', async (t) => {
  const { req, client } = await setup(t, { allowedOrigins: ['http://127.0.0.1:5173'] });
  const login = await req(
    '/auth/login',
    'POST',
    { email: 'cliente@trena.demo', password: 'Trena@2026' },
    '',
    { Origin: 'http://127.0.0.1:5173' },
  );
  assert.equal(login.status, 200);
  assert.ok(login.cookie);
  assert.equal((await req('/services', 'POST', [], client)).status, 400);
  assert.equal(
    (await req('/services', 'POST', { ...service, professional_id: {} }, client)).status,
    400,
  );
  assert.equal(
    (
      await req(
        '/auth/login',
        'POST',
        { email: 'cliente@trena.demo', password: 'Trena@2026' },
        '',
        { Origin: 'http://127.0.0.1:7777' },
      )
    ).status,
    403,
  );
});
