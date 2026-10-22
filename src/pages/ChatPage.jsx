import { useState } from 'react';
import { Calculator, Check, Send } from 'lucide-react';
import { formatCurrency, formatDate, formatTime } from '../app/formatters';
import { Avatar, Empty, ImagesInput, Status } from '../components/ui';

export default function ChatPage({
  user,
  conversations,
  services = [],
  selectedChat,
  messages,
  message,
  attachment,
  busy,
  messageEnd,
  onSelectChat,
  onMessageChange,
  onAttachmentChange,
  onAttachmentError,
  onSendMessage,
  onSendCounterProposal,
  onConfirmHiring,
}) {
  const isClient = user?.role === 'client';
  const currentChat = conversations.find((conversation) => conversation.id === selectedChat);
  const currentService = services.find((service) => service.id === currentChat?.service_id);
  const referenceBudget = currentChat?.budget ?? currentService?.budget;
  const referenceDeadline = currentChat?.deadline ?? currentService?.deadline;
  const hasReferenceBudget = Number.isFinite(Number(referenceBudget));
  const hasReferenceDeadline = Boolean(referenceDeadline);
  const canSendCounterProposal = !isClient && currentChat?.status === 'negotiating';
  const [proposalOpen, setProposalOpen] = useState(false);

  function handleCounterProposal(event) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    onSendCounterProposal(data);
    event.currentTarget.reset();
    setProposalOpen(false);
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">CADA DETALHE COMBINADO</span>
          <h1>Boas obras começam com uma conversa.</h1>
          <p>Alinhe escopo, materiais, valores e prazos antes de confirmar.</p>
        </div>
      </div>
      <div className="chat-layout">
        <aside className="conversation-list">
          <h3>
            Suas conversas <span>{conversations.length}</span>
          </h3>
          {!conversations.length && (
            <p className="muted">
              Inicie uma conversa em um serviço ou envie uma solicitação a um profissional.
            </p>
          )}
          {conversations.map((conversation) => (
            <button
              key={conversation.id}
              className={
                conversation.id === selectedChat ? 'conversation selected' : 'conversation'
              }
              onClick={() => onSelectChat(conversation.id)}
            >
              <Avatar name={isClient ? conversation.professional_name : conversation.client_name} />
              <div>
                <strong>
                  {isClient ? conversation.professional_name : conversation.client_name}
                </strong>
                <span>{conversation.title}</span>
                <small>{conversation.last_message || 'Combine os detalhes do serviço'}</small>
              </div>
            </button>
          ))}
        </aside>
        <section className="chat-panel">
          {currentChat ? (
            <>
              <div className="chat-heading">
                <div>
                  <h3>{isClient ? currentChat.professional_name : currentChat.client_name}</h3>
                  <p>{currentChat.title}</p>
                </div>
                <Status value={currentChat.status} />
              </div>
              {isClient && currentChat.status === 'negotiating' && (
                <div className="chat-notice">
                  <span>Já combinaram os detalhes?</span>
                  <button className="text-button" onClick={() => onConfirmHiring(currentChat)}>
                    Confirmar contratação <Check size={16} />
                  </button>
                </div>
              )}
              {canSendCounterProposal && (
                <div className="counter-proposal-panel">
                  <div>
                    <span className="eyebrow">NEGOCIAÇÃO</span>
                    <h3>Envie uma contraproposta</h3>
                    <p>
                      Referência do cliente:{' '}
                      {hasReferenceBudget ? formatCurrency(referenceBudget) : 'valor não informado'}
                      {hasReferenceDeadline ? ` até ${formatDate(referenceDeadline)}` : ''}.
                    </p>
                  </div>
                  {!proposalOpen ? (
                    <button className="button small" onClick={() => setProposalOpen(true)}>
                      Propor valor e prazo <Calculator size={16} />
                    </button>
                  ) : (
                    <form className="counter-proposal-form" onSubmit={handleCounterProposal}>
                      <input
                        name="budget"
                        type="number"
                        min="0.01"
                        max="10000000"
                        step="0.01"
                        required
                        placeholder="Valor (R$)"
                        aria-label="Valor da contraproposta"
                      />
                      <input
                        name="deadline"
                        type="date"
                        required
                        min={new Date().toISOString().slice(0, 10)}
                        aria-label="Prazo da contraproposta"
                      />
                      <input
                        name="note"
                        maxLength={220}
                        placeholder="Observação opcional"
                        aria-label="Observação da contraproposta"
                      />
                      <button className="button" disabled={busy}>
                        Enviar <Send size={16} />
                      </button>
                      <button
                        type="button"
                        className="text-button"
                        onClick={() => setProposalOpen(false)}
                      >
                        Cancelar
                      </button>
                    </form>
                  )}
                </div>
              )}
              <div className="messages" aria-live="polite">
                {!messages.length && (
                  <p className="chat-start">
                    Este é o início da conversa. Conte um pouco sobre o projeto.
                  </p>
                )}
                {messages.map((item) => (
                  <div
                    className={'message ' + (item.sender_id === user?.id ? 'own' : '')}
                    key={item.id}
                  >
                    <small>{item.sender_name}</small>
                    {item.text && <p>{item.text}</p>}
                    {item.image && (
                      <a href={item.image} target="_blank" rel="noreferrer">
                        <img src={item.image} alt="Imagem compartilhada na conversa" />
                      </a>
                    )}
                    <time>{formatTime(item.created_at)}</time>
                  </div>
                ))}
                <div ref={messageEnd} />
              </div>
              <form className="message-form" onSubmit={onSendMessage}>
                <ImagesInput
                  value={attachment}
                  onChange={(images) => onAttachmentChange(images.slice(-1))}
                  label="Anexar imagem"
                  onError={onAttachmentError}
                />
                <div className="message-compose">
                  <input
                    aria-label="Sua mensagem"
                    placeholder="Vamos falar sobre o projeto…"
                    maxLength={4000}
                    value={message}
                    onChange={(event) => onMessageChange(event.target.value)}
                  />
                  <button
                    className="button"
                    disabled={busy || (!message.trim() && !attachment.length)}
                    aria-label="Enviar mensagem"
                  >
                    <Send size={19} />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <Empty title="Uma conversa muda tudo">
              Selecione uma conversa para negociar seu projeto.
            </Empty>
          )}
        </section>
      </div>
    </>
  );
}
