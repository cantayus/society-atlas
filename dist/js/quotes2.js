/* The Society Atlas V2 — words for the title screen. The first edition's two quotations
   come first; the rest were added for this edition. Each is short and quoted as written
   (older spelling modernised where noted in docs/NEW_ENCOUNTERS_REVIEW.md). */
(function () {
  'use strict';
  const SA = window.SA, wq = (page) => 'https://en.wikiquote.org/wiki/' + page;
  const old = ((window.ATLAS_QUOTES || {}).menu || []).map((q) => ({ text: q.text, author: q.author, work: q.date || '', source: q.source }));
  const more = [
    ['If a man will begin with certainties, he shall end in doubts; but if he will be content to begin with doubts, he shall end in certainties.', 'Francis Bacon', 'The Advancement of Learning, 1605', 'Francis_Bacon'],
    ['A wise man, therefore, proportions his belief to the evidence.', 'David Hume', 'An Enquiry Concerning Human Understanding, 1748', 'David_Hume'],
    ['It is not from the benevolence of the butcher, the brewer, or the baker, that we expect our dinner, but from their regard to their own interest.', 'Adam Smith', 'The Wealth of Nations, 1776', 'Adam_Smith'],
    ['He who knows only his own side of the case, knows little of that.', 'John Stuart Mill', 'On Liberty, 1859', 'John_Stuart_Mill'],
    ['The problem of the twentieth century is the problem of the color-line.', 'W. E. B. Du Bois', 'The Souls of Black Folk, 1903', 'W._E._B._Du_Bois'],
    ['when you can measure what you are speaking about, and express it in numbers, you know something about it', 'Lord Kelvin', 'lecture on electrical units of measurement, 1883', 'William_Thomson'],
    ['the great tragedy of Science—the slaying of a beautiful hypothesis by an ugly fact', 'Thomas Henry Huxley', 'Biogenesis and Abiogenesis, 1870', 'Thomas_Henry_Huxley'],
    ['It is a capital mistake to theorize before one has data.', 'Sherlock Holmes', 'in Arthur Conan Doyle’s A Scandal in Bohemia, 1891', 'Arthur_Conan_Doyle'],
    ['man is by nature a political animal', 'Aristotle', 'Politics, in Jowett’s translation', 'Aristotle'],
    ['the theory of probabilities is at bottom only common sense reduced to calculus', 'Pierre-Simon Laplace', 'A Philosophical Essay on Probabilities, 1814', 'Pierre-Simon_Laplace'],
    ['Science is built up with facts, as a house is with stones. But a collection of facts is no more a science than a heap of stones is a house.', 'Henri Poincaré', 'Science and Hypothesis, 1902', 'Henri_Poincar%C3%A9'],
    ['In the long run we are all dead.', 'John Maynard Keynes', 'A Tract on Monetary Reform, 1923', 'John_Maynard_Keynes'],
    ['If I have seen further it is by standing on the shoulders of Giants.', 'Isaac Newton', 'letter to Robert Hooke, 1675', 'Isaac_Newton'],
    ['If there is no struggle there is no progress.', 'Frederick Douglass', 'speech at Canandaigua, New York, 1857', 'Frederick_Douglass'],
    ['The Analytical Engine has no pretensions whatever to originate anything. It can do whatever we know how to order it to perform.', 'Ada Lovelace', 'notes on the Analytical Engine, 1843', 'Ada_Lovelace'],
    ['Pray, Mr. Babbage, if you put into the machine wrong figures, will the right answers come out?', 'A question put to Charles Babbage', 'as he tells it in Passages from the Life of a Philosopher, 1864', 'Charles_Babbage'],
    ['All models are wrong but some are useful.', 'George Box', '1979', 'George_E._P._Box'],
    ['a wealth of information creates a poverty of attention', 'Herbert A. Simon', '1971', 'Herbert_A._Simon'],
    ['Research is formalized curiosity. It is poking and prying with a purpose.', 'Zora Neale Hurston', 'Dust Tracks on a Road, 1942', 'Zora_Neale_Hurston'],
    ['Extraordinary claims require extraordinary evidence.', 'Carl Sagan', 'Cosmos, 1980', 'Carl_Sagan'],
    ['to express my self in Terms of Number, Weight, or Measure', 'William Petty', 'Political Arithmetick, 1690', 'William_Petty'],
    ['Knowledge is of two kinds. We know a subject ourselves, or we know where we can find information upon it.', 'Samuel Johnson', 'in Boswell’s Life of Johnson, 1791', 'Samuel_Johnson'],
    ['Do not block the way of inquiry.', 'Charles Sanders Peirce', '1898', 'Charles_Sanders_Peirce'],
    ['Civilization advances by extending the number of important operations which we can perform without thinking about them.', 'Alfred North Whitehead', 'An Introduction to Mathematics, 1911', 'Alfred_North_Whitehead'],
    ['the man of the future is the man of statistics and the master of economics', 'Oliver Wendell Holmes Jr.', 'The Path of the Law, 1897', 'Oliver_Wendell_Holmes_Jr.'],
    ['It may seem a strange principle to enunciate as the very first requirement in a Hospital that it should do the sick no harm.', 'Florence Nightingale', 'Notes on Hospitals, 1863', 'Florence_Nightingale'],
    ['How odd it is that anyone should not see that all observation must be for or against some view if it is to be of any service!', 'Charles Darwin', 'letter to Henry Fawcett, 1861', 'Charles_Darwin'],
    ['A little learning is a dangerous thing.', 'Alexander Pope', 'An Essay on Criticism, 1711', 'Alexander_Pope'],
    ['Power tends to corrupt, and absolute power corrupts absolutely.', 'Lord Acton', 'letter to Mandell Creighton, 1887', 'John_Dalberg-Acton,_1st_Baron_Acton'],
    ['If men were angels, no government would be necessary.', 'James Madison', 'The Federalist No. 51, 1788', 'James_Madison'],
    ['My experience is what I agree to attend to.', 'William James', 'The Principles of Psychology, 1890', 'William_James'],
    ['The question is not what you look at, but what you see.', 'Henry David Thoreau', 'journal, 1851', 'Henry_David_Thoreau'],
    ['In the fields of observation chance favors only the prepared mind.', 'Louis Pasteur', 'lecture at Lille, 1854', 'Louis_Pasteur'],
  ].map(([text, author, work, page]) => ({ text, author, work, source: wq(page) }));
  SA.QUOTES = [...old, ...more];
})();
