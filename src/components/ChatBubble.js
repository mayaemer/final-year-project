import "../styles/ChatBubble.css";

const ChatBubble = ({ message, isCurrentUser, time, date }) => {
    return (
      <div className={`chatbubble ${isCurrentUser ? 'currentUser' : 'otherUser'}`}>
        <p>{message}</p>
        <p>{date}</p>
        <p>{time}</p>
      </div>
    );
  };
  
  export default ChatBubble;