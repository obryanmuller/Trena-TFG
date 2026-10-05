import { Check, Send } from 'lucide-react';
import { formatTime } from '../app/formatters';
import { Avatar, Empty, ImagesInput, Status } from '../components/ui';

export default function ChatPage({
  user,
  conversations,
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
  onConfirmHiring,
}) {
  const isClient = user?.role === 'client';
  const currentChat = conversations.find((conversation) => conversation.id === selectedChat);

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
