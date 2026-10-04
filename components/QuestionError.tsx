'use client';

import { useEffect, useRef } from 'react';
import { CircleAlert } from 'lucide-react';
import './question-error.css';

export default function QuestionError({ onClose }: { onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    return () => { element?.close(); };
  }, []);

  return <dialog ref={dialog} className="question-error" aria-labelledby="question-error-title" aria-describedby="question-error-message" onClose={onClose} onClick={event => event.stopPropagation()}>
    <CircleAlert size={42} className="question-error-symbol" aria-hidden="true"/>
    <h2 id="question-error-title">Error</h2>
    <p id="question-error-message">asthetreegrowbigger</p>
    <form method="dialog"><button autoFocus>OK</button></form>
  </dialog>;
}
