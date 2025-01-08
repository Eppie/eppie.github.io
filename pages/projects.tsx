import React from 'react';
import Link from 'next/link';

const ProjectsPage: React.FC = () => {
  return (
    <div>
      <p>
        <Link href='/projects/poker-quiz'>Poker Decision Quiz</Link>
      </p>
      <p>
        <Link href='/projects/keyboard'>Keyboard (WIP)</Link>
      </p>
      <p>
        <Link href='/projects/bit_calculator'>Bitwise Calculator (WIP)</Link>
      </p>
      <p>
        <Link href='/projects/complement'>DNA Complement (WIP)</Link>
      </p>
      <p>
        <Link href='/projects/llm_roleplay'>LLM Roleplay (WIP)</Link>
      </p>
      <p>
        <Link href='/projects/sd_lora'>
          Stable Diffusion Fine-Tuning (coming soon)
        </Link>
      </p>
      <p>
        <Link href='/projects/compression'>Compression (coming soon)</Link>
      </p>
      <p>
        <Link href='/projects/llm_bias'>LLM Bias (coming soon)</Link>
      </p>
      <p>
        <Link href='/projects/brocard'>Brocard Problem</Link>
      </p>
    </div>
  );
};

export default ProjectsPage;
