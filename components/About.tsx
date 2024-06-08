import React from 'react';
import styles from '../styles/About.module.css';

const About: React.FC = () => {
  return (
    <div className={styles.aboutPage}>
      <h1>About Me</h1>
      <section>
        <h2>Hi there!</h2>
        <p>
          I&apos;m Andrew, a passionate backend software engineer based in
          Philadelphia. With a love for solving complex problems and a knack for
          building efficient systems, I&apos;ve spent my career turning
          innovative ideas into reality. When I&apos;m not coding, you can find
          me exploring the vibrant food scene in Philly or indulging in my
          latest hobby – photography.
        </p>
      </section>
      <section>
        <h2>What I Do</h2>
        <p>
          My professional journey has taken me through various exciting roles
          where I&apos;ve had the opportunity to work on cutting-edge
          technologies and collaborate with brilliant minds. At Freenome, I lead
          the development of backend systems that power genomic data processing,
          contributing to advancements in healthcare. Previously, at Elsevier, I
          managed a team of talented engineers to create impactful products in
          the healthcare and research fields.
        </p>
      </section>
      <section>
        <h2>Skills and Interests</h2>
        <p>
          Over the years, I&apos;ve honed my skills in Python, Java, and C/C++,
          and I&apos;ve become well-versed in cloud platforms like GCP and AWS.
          I enjoy diving into data engineering with tools like PostgreSQL and
          Snowflake, and I&apos;m a big advocate for DevOps practices,
          leveraging Docker and Kubernetes to streamline workflows.
        </p>
        <p>
          Beyond work, I&apos;m always eager to learn and explore new
          technologies. Recently, I&apos;ve been experimenting with interactive
          data visualizations using D3.js and optimizing performance with
          WebAssembly. Open source contributions are also close to my heart – I
          love giving back to the community and collaborating on exciting
          projects.
        </p>
      </section>
      <section>
        <h2>Education</h2>
        <p>
          I hold a Bachelor&apos;s degree in Computer Science from the
          University of Delaware, with a concentration in Artificial
          Intelligence and a minor in Psychology. My academic journey sparked my
          fascination with AI and continues to influence my work today.
        </p>
      </section>
      <section>
        <h2>Personal Projects</h2>
        <p>
          My personal projects are a reflection of my curiosity and drive to
          innovate. I built this website with React and host it on GitHub Pages,
          aiming to showcase my skills and share my journey with the world. I
          also enjoy creating interactive data visualizations and contributing
          to open-source projects – it&apos;s a great way to stay sharp and
          connected with the tech community.
        </p>
      </section>
      <section>
        <h2>Certifications</h2>
        <p>
          To continually enhance my expertise, I&apos;ve earned certifications
          such as Certified Kubernetes Administrator (CKA), AWS Certified
          Solutions Architect – Associate, and Google Cloud Professional Data
          Engineer. These certifications validate my skills and commitment to
          staying at the forefront of technology.
        </p>
      </section>
      <section>
        <h2>Let&apos;s Connect</h2>
        <p>
          I&apos;m always excited to connect with like-minded professionals and
          explore new opportunities. Whether you want to discuss a potential
          collaboration or just say hello, feel free to reach out via{' '}
          <a href='mailto:your-email@example.com'>email</a> or connect with me
          on
          <a href='https://www.linkedin.com/in/your-linkedin/'>LinkedIn</a>.
        </p>
      </section>
    </div>
  );
};

export default About;
