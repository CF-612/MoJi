import React from 'react';
import moji from '../../assets/moji.png';

interface Props {
  busy: boolean;
  onCreate: () => unknown;
}

/** Keep the original welcome composition, without onboarding or feature lists. */
export function EmptyLibrary({busy,onCreate}: Props) {
  return <div className="welcome-scroll welcome-empty">
    <section className="welcome-empty-document" aria-label="开始创作">
      <div className="welcome-empty-hero">
        <div className="welcome-empty-copy">
          <span className="welcome-empty-ghost" aria-hidden="true">STORIES</span>
          <h1>你的故事，<br/>从这里开始。</h1>
          <button type="button" className="primary welcome-empty-create" disabled={busy} onClick={onCreate}>创建第一部作品</button>
        </div>
        <img className="welcome-empty-mascot" src={moji} width={1000} height={1000} alt="蓝色烟灰蛸" draggable={false}/>
      </div>
    </section>
  </div>;
}
