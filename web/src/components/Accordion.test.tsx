import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Accordion, { type AccordionItem } from './Accordion';

const ITEMS: AccordionItem[] = [
  { id: 'q1', question: 'Question 1', answer: 'Réponse 1' },
  { id: 'q2', question: 'Question 2', answer: 'Réponse 2' },
  { id: 'q3', question: 'Question 3', answer: 'Réponse 3' },
];

describe('Accordion', () => {
  it('rend toutes les questions sous forme de <summary> cliquables', () => {
    render(<Accordion items={ITEMS} ariaLabel="Test FAQ" />);
    expect(screen.getByText('Question 1')).toBeInTheDocument();
    expect(screen.getByText('Question 2')).toBeInTheDocument();
    expect(screen.getByText('Question 3')).toBeInTheDocument();
  });

  it("commence avec tous les items fermés (l'attribut `open` est absent)", () => {
    render(<Accordion items={ITEMS} />);
    const details = document.querySelectorAll('details');
    expect(details).toHaveLength(3);
    details.forEach((d) => {
      expect(d.hasAttribute('open')).toBe(false);
    });
  });

  it('ouvre un item au clic sur le <summary>', async () => {
    const user = userEvent.setup();
    render(<Accordion items={ITEMS} />);
    const firstSummary = screen.getByTestId('accordion-summary-q1');
    await user.click(firstSummary);
    const firstDetails = screen.getByTestId('accordion-item-q1');
    expect(firstDetails.hasAttribute('open')).toBe(true);
  });

  it('referme un item au second clic (toggle)', async () => {
    const user = userEvent.setup();
    render(<Accordion items={ITEMS} />);
    const summary = screen.getByTestId('accordion-summary-q2');
    const details = screen.getByTestId('accordion-item-q2');
    await user.click(summary);
    expect(details.hasAttribute('open')).toBe(true);
    await user.click(summary);
    expect(details.hasAttribute('open')).toBe(false);
  });

  it('propage `ariaLabel` sur le conteneur', () => {
    render(<Accordion items={ITEMS} ariaLabel="Mon groupe" />);
    expect(screen.getByRole('group', { name: 'Mon groupe' })).toBeInTheDocument();
  });

  it('propage `testId` sur le conteneur', () => {
    render(<Accordion items={ITEMS} testId="faq-group" />);
    expect(screen.getByTestId('faq-group')).toBeInTheDocument();
  });
});
