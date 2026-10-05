import { useEffect, useRef } from 'react';
import { BriefcaseBusiness, ImagePlus, X } from 'lucide-react';
import { STATUSES } from '../app/config';
import { getInitials } from '../app/formatters';

export function Avatar({ name, large = false }) {
  return <span className={'avatar ' + (large ? 'large' : '')}>{getInitials(name)}</span>;
}

export function Status({ value }) {
  return (
    <span className={'status ' + value}>
      <i />
      {STATUSES[value]}
    </span>
  );
}

export function Empty({ title, children }) {
  return (
    <div className="empty">
      <BriefcaseBusiness size={32} />
      <h3>{title}</h3>
      <p>{children}</p>
    </div>
  );
}

export function Field({ label, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}

export function Modal({ title, onClose, children }) {
  const dialog = useRef();

  useEffect(() => {
    const element = dialog.current;
    element.showModal();
    return () => element.close();
  }, []);

  return (
    <dialog
      aria-labelledby="modal-title"
      ref={dialog}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === dialog.current) onClose();
      }}
    >
      <div className="modal-heading">
        <div>
          <span className="eyebrow">TRENA · CONEXÕES QUE CONSTROEM</span>
          <h2 id="modal-title">{title}</h2>
        </div>
        <button className="icon-button" onClick={onClose} aria-label="Fechar">
          <X />
        </button>
      </div>
      {children}
    </dialog>
  );
}

export function ImagesInput({ value, onChange, label = 'Fotos do serviço', onError }) {
  async function loadImages(event) {
    const files = Array.from(event.target.files);

    try {
      if (value.length + files.length > 6) throw new Error('Selecione até 6 fotos no total.');

      const images = await Promise.all(files.map(readImage));
      onChange([...value, ...images]);
    } catch (error) {
      onError(error.message);
    }

    event.target.value = '';
  }

  return (
    <div className="image-input">
      <label className="upload">
        <ImagePlus size={22} />
        <span>
          {label}
          <small>PNG, JPG ou WebP · até 6 fotos de 500 KB</small>
        </span>
        <input
          aria-label={label}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          multiple
          onChange={loadImages}
        />
      </label>
      {value.length > 0 && (
        <div className="image-grid">
          {value.map((image, index) => (
            <div key={image.slice(-40) + index}>
              <img src={image} alt={`Foto adicionada ${index + 1}`} />
              <button
                type="button"
                className="icon-button"
                aria-label={`Remover foto ${index + 1}`}
                onClick={() => onChange(value.filter((_, itemIndex) => itemIndex !== index))}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function readImage(file) {
  return new Promise((resolve, reject) => {
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 512000) {
      reject(new Error('Use imagens PNG, JPEG ou WebP de até 500 KB.'));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Não foi possível ler a imagem.'));
    reader.readAsDataURL(file);
  });
}
