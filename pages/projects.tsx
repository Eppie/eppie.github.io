import React from 'react';
import Link from 'next/link';

const ProjectsPage: React.FC = () => {
  return (
      <div>
          <p>
              <Link href='/complement'>DNA Complement (WIP)</Link>
          </p>
          <p>
              <Link href='/llm_roleplay'>LLM Roleplay (WIP)</Link>
          </p>
          <p>
              <Link href='/sd_lora'>Stable Diffusion Fine-Tuning (coming soon)</Link>
          </p>
          <p>
              <Link href='/compression'>Compression (coming soon)</Link>
          </p>
          <p>
              <Link href='/llm_bias'>LLM Bias (coming soon)</Link>
          </p>
          <p>
              <Link href='/brocard'>Brocard Problem</Link>
          </p>
      </div>
  );
};

export default ProjectsPage;
