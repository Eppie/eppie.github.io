import React from 'react';
import {darcula} from "react-syntax-highlighter/dist/esm/styles/prism";
import {Prism as SyntaxHighlighter} from "react-syntax-highlighter";
const codeString1: string = `// Example of logging output
std::cout << "Testing range " << start << " to " << end << std::endl;
if (is_potential_solution) {{
    std::cout << "Potential solution found: n = " << n << ", m = " << m << std::endl;
}}`;
const BrocardPage: React.FC = () => {
  return (
    <div>
      <h1>Extending the Search for Brocard&apos;s Problem: From 10<sup>12</sup> to 10<sup>15</sup></h1>
      <section>
        <h2>Introduction</h2>
        <p>
          Brocard&apos;s problem, posed by Henri Brocard in 1876, asks if there are integers <code>n</code> and <code>m</code> such that <code>n! + 1 = m^2</code>. Known solutions include <code>n = 4, 5,</code> and <code>7</code>, with extensive searches up to <code>10^{12}</code> yielding no additional solutions. Inspired by the comprehensive paper by Robert D. Matson, I sought to extend the search up to <code>10^{15}</code>.
        </p>
      </section>
      <section>
        <h2>Understanding the Paper</h2>
        <p>
          Matson&apos;s paper utilized quadratic residues and the Legendre symbol to efficiently test large values of <code>n</code>. The approach relies on testing <code>n! + 1</code> against a set of large primes to determine if it could be a perfect square. If <code>n! + 1</code> is not a quadratic residue modulo any of these primes, then <code>n</code> is not a solution.
        </p>
      </section>
      <section>
        <h2>Developing the Code</h2>
        <p>
          Using the insights from Matson&apos;s paper, I developed a C++ program that partitions the search range <code>(1, 10^{15})</code> into smaller sub-ranges and employs parallel processing to improve efficiency. Here&apos;s a breakdown of the key steps in the code:
        </p>
        <ul>
          <li><strong>Initialization</strong>: The program initializes a list of large primes and prepares the search ranges.</li>
          <li><strong>Parallel Processing</strong>: The search range is divided into smaller chunks, each processed in parallel to speed up the computation.</li>
          <li><strong>Modular Arithmetic and Jacobi Symbol</strong>: For each candidate <code>n</code>, the program calculates <code>n! + 1</code> and tests it against the set of primes using the Jacobi symbol to determine if it is a quadratic residue.</li>
          <li><strong>Logging and Results</strong>: Potential solutions are logged and written to a file, with progress updates printed to the console.</li>
        </ul>
          <SyntaxHighlighter language='python' style={darcula}>
        {codeString1}
      </SyntaxHighlighter>
      </section>
      <section>
        <h2>Running the Program</h2>
        <p>
          The program systematically tests each sub-range, leveraging modern multi-core processors to handle the extensive calculations required. Despite the extended range, no new solutions were found up to <code>10^{15}</code>.
        </p>
      </section>
      <section>
        <h2>Conclusion</h2>
        <p>
          The extension of the search for solutions to Brocard&apos;s problem from <code>10^{12}</code> to <code>10^{15}</code> showcases the power of combining theoretical insights with computational methods. While no new solutions were discovered, the process highlights the importance of continued exploration and the potential for future discoveries in number theory.
        </p>
        <p>
          For those interested in the technical details, the full code is available on <a href="https://raw.githubusercontent.com/jhg023/brocard/master/Brocard.cpp">GitHub</a>.
        </p>
      </section>
    </div>
  );
};

export default BrocardPage;