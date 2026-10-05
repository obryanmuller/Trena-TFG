import { CATEGORIES, fail } from './domain.mjs';

const IMAGE_PATTERN = /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/;
const MAX_IMAGE_BYTES = 512000;
const MAX_IMAGE_DATA_URL_LENGTH = 750000;

export function textField(value, name, min = 1, max = 200) {
  if (typeof value !== 'string' || value.trim().length < min || value.trim().length > max) {
    fail(400, `${name}: informe entre ${min} e ${max} caracteres.`);
  }

  return value.trim();
}

export function specialty(value) {
  if (!CATEGORIES.includes(value)) fail(400, 'Escolha uma especialidade válida.');
  return value;
}

export function imageList(value) {
  if (!Array.isArray(value) || value.length > 6) fail(400, 'Envie no máximo 6 imagens.');

  for (const image of value) validateImage(image);

  return value;
}

export function serviceInput(body) {
  return {
    title: textField(body.title, 'Título', 5, 100),
    description: textField(body.description, 'Descrição', 20, 4000),
    category: specialty(body.category),
    city: textField(body.city, 'Cidade e UF', 3, 100),
    budget: serviceBudget(body.budget),
    deadline: serviceDeadline(body.deadline),
    images: imageList(body.images || []),
  };
}

export function reviewInput(body) {
  const rating = Number(body.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    fail(400, 'A nota deve estar entre 1 e 5.');
  }

  return {
    rating,
    comment: textField(body.comment, 'Comentário', 5, 2000),
  };
}

function serviceBudget(value) {
  const budget = Number(value);
  if (!Number.isFinite(budget) || budget <= 0 || budget > 10000000) {
    fail(400, 'Informe um orçamento entre R$ 0,01 e R$ 10.000.000.');
  }

  return budget;
}

function serviceDeadline(value) {
  const today = new Date().toISOString().slice(0, 10);

  if (
    typeof value !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
    Number.isNaN(Date.parse(value)) ||
    new Date(value).toISOString().slice(0, 10) !== value ||
    value < today
  ) {
    fail(400, 'Informe uma data válida, a partir de hoje.');
  }

  return value;
}

function validateImage(image) {
  if (
    typeof image !== 'string' ||
    image.length > MAX_IMAGE_DATA_URL_LENGTH ||
    !IMAGE_PATTERN.test(image)
  ) {
    fail(400, 'Imagem inválida. Use PNG, JPEG ou WebP de até 500 KB.');
  }

  const bytes = Buffer.from(image.split(',')[1], 'base64');
  if (!hasValidImageSignature(image, bytes) || bytes.length > MAX_IMAGE_BYTES) {
    fail(400, 'O conteúdo da imagem é inválido ou excede 500 KB.');
  }
}

function hasValidImageSignature(image, bytes) {
  if (image.startsWith('data:image/png;')) {
    return bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  }

  if (image.startsWith('data:image/jpeg;')) {
    return bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  }

  return bytes.subarray(0, 4).toString() === 'RIFF' && bytes.subarray(8, 12).toString() === 'WEBP';
}
