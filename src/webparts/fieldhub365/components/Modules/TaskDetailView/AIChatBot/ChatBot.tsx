/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import * as React from "react";
import { useEffect, useState } from "react";
import ReactWebChat, {
  createDirectLine,
  createStyleSet,
} from "botframework-webchat";

interface ICitation {
  id: string;
  title: string;
  url: string;
}

/* ---------------- CITATION MIDDLEWARE ---------------- */

const citationMiddleware = () => (next: any) => (card: any) => {
  const renderer = next(card);

  if (!renderer) {
    return renderer;
  }

  const citations = card.activity?.channelData?.citations;

  return (...args: any[]) => (
    <div>
      {renderer(...args)}

      {citations?.length > 0 && (
        <div style={{ marginTop: 8, paddingLeft: 12 }}>
          {citations.map((c: ICitation) => (
            <div key={c.id}>
              [{c.id}]{" "}
              <a href={c.url} target="_blank" rel="noopener noreferrer">
                {c.title}
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ---------------- GLOBAL CSS ---------------- */

const GLOBAL_CSS = `
.webchat-card{
width:100%;
height:88vh;
border-radius:26px;
overflow:hidden;
display:flex;
flex-direction:column;
background:#F5F6FA;
box-shadow:0 10px 40px rgba(0,0,0,0.15);
font-family: "Euclid Circular A Regular", sans-serif !important;
}

p{
font-family: "Euclid Circular A Regular", sans-serif !important;
min-height: 14px !important;
font-size: 12px !important;
}
span{
font-family: "Euclid Circular A Regular", sans-serif !important;
}

.webchat__send-box-text-box__input{
font-family: "Euclid Circular A Regular", sans-serif !important;
}

/* force webchat layout */
.webchat-card > div{
flex:1;
display:flex;
flex-direction:column;
}

.webchat__basic-transcript{
flex:1 !important;
overflow-y:auto !important;
background:#F5F6FA !important;
padding:20px 10px !important;
}

/* bot bubble */
.webchat__bubble:not(.webchat__bubble--from-user) .webchat__bubble__content{
background:#EEF1F8!important;
border-radius:15px!important;
font-size:14px;
line-height:1.6;
color:#222;
max-width:85%;
border:1px solid #cbcbcb !important;
}

/* user bubble */
.webchat__bubble--from-user .webchat__bubble__content{
background:#5B5FC7!important;
color:white!important;
border-radius:15px!important;
font-size:14px;
}

/* hide avatars */
.webchat__bubble__avatar-gutter{
display:none!important;
}

/* suggested actions */
.webchat__suggested-actions{
padding:12px 16px!important;
gap:10px!important;
flex-wrap:wrap!important;
background:#F5F6FA!important;
}

.webchat__suggested-actions__button{
border-radius:50px!important;
padding:8px 16px!important;
border:1px solid #D3D6E5!important;
background:white!important;
font-size:13px!important;
}

/* send box */
.webchat__send-box{
background:#F5F6FA!important;
padding:14px!important;
border-top:none!important;
}

.webchat__send-box__main{
border-radius:16px!important;
border:1px solid #D6D9E6!important;
background:white!important;
padding:4px!important;
}

.webchat__send-box__main:focus-within{
border-color:#5B5FC7!important;
box-shadow:0 0 0 2px rgba(91,95,199,0.15);
}

.webchat__send-box__button{
background:#5B5FC7!important;
color:white!important;
border-radius:31%!important;
width:38px!important;
height:38px!important;
margin:1px 1px 0px 0px !important;
}

.webchat__send-icon{
fill:#F5F6FA !important;
}

.webchat__icon-button__shade{
display:none !important;
}
`;

function injectCSS() {
  if (document.getElementById("chat-style")) return;

  const style = document.createElement("style");
  style.id = "chat-style";
  style.innerHTML = GLOBAL_CSS;
  document.head.appendChild(style);
}

interface JobsViewProps {
  isMain: boolean;
}

/* ---------------- COMPONENT ---------------- */

const CoPilotChat: React.FC<JobsViewProps> = ({ isMain }) => {
  const [directLine, setDirectLine] = useState<any>(null);
  const initializeWebChat = (): void => {
    const secret: string = "test";
    const dl = createDirectLine({ secret });
    dl.activity$.subscribe((activity: any) => {});
    setDirectLine(dl);
  };
  useEffect(() => {
    initializeWebChat();
  }, []);
  useEffect(() => {
    injectCSS();
  }, []);
  useEffect(() => {
    setTimeout(() => {
      const input = document.querySelector(
        ".webchat__send-box-text-box__input",
      ) as HTMLInputElement;

      input?.focus();
    }, 300);
  }, []);

  const styleOptions = {
    hideUploadButton: true,
    bubbleBorderRadius: 20,
    bubbleFromUserBorderRadius: 30,
    avatarSize: 0,
    sendBoxPlaceholder: "Ask Field 365 AI...",
  };

  const styleSet = createStyleSet(styleOptions);

  return (
    <div style={{ padding: isMain ? "20px" : "0px" }}>
      <div className="webchat-card">
        {directLine && (
          <ReactWebChat
            directLine={directLine}
            userID="alex"
            styleOptions={styleOptions}
            styleSet={styleSet}
            activityMiddleware={[citationMiddleware]}
          />
        )}
      </div>
    </div>
  );
};

export default CoPilotChat;
