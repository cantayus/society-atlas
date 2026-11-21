/* The Society Atlas V2 — encounter registry.
   Encounters 1–18 come unchanged from the original edition (legacy/data.js).
   Encounters 19–30 are new in V2. As before: the research anchors are real and
   linked; all dialogue, datasets, rooms and campus routes are teaching fiction.
   NEW ENTRIES NEED THE OWNER'S SCHOLARLY REVIEW — see docs/NEW_ENCOUNTERS_REVIEW.md. */
(function () {
  'use strict';
  const host = typeof window !== 'undefined' ? window : globalThis;
  const SA = host.SA, D = host.ATLAS_DATA || { encounters: [], sources: [] };

  const clue = (what, where) => `The south-plaza directory lists ${what}. The archive west of the plaza keeps its notice; ${where} stands in the north-east, reached by the eastern walk.`;
  const NEW = [
    { id: 19, shortName: 'Lazarsfeld', name: 'Paul Lazarsfeld', collaborators: 'Bernard Berelson, Hazel Gaudet and the Bureau’s interviewers', campus: 'Columbia University', era: '1944 · study of the 1940 election', year: 1944,
      title: 'Who Told You?', method: 'Panel surveys & the two-step flow', objective: 'Find the Bureau’s interview room and trace how news reaches a neighbourhood.', office: 'Bureau of Applied Social Research',
      clue: clue('a panel study of voters', 'the Bureau'),
      dialogue: ['We interviewed the same people again and again through a campaign. Ask not only what they heard, but from whom.', 'Broadcast the festival notice to everyone, then brief only the people each circle listens to. Count who actually ends up informed.', 'Narrator: The 1940 Erie County study suggested this pattern; it did not trace each step directly. Later work found more tangled routes.'],
      limitation: 'The original panel inferred the two steps rather than observing them, and later studies found influence flowing in several directions.', transfer: 'Whom do Eastbank residents actually listen to about the festival, and does word reach those people?',
      evidence: 'In this town, briefing the people each circle listens to informed more residents than the broadcast alone, except where a circle had no such person.', sourceIds: ['lazarsfeld', 'lazarsfeld-two-step'], theme: 'classical', palette: { wall: '#a8644c', roof: '#7f9488', grass: '#7b9477' } },
    { id: 20, shortName: 'Arrow', name: 'Kenneth Arrow', collaborators: 'A fictional seminar of voters', campus: 'Stanford University', era: '1951', year: 1951,
      title: 'Three Ways to Count', method: 'Social choice & voting rules', objective: 'Find the seminar room and make three fair-looking rules disagree.', office: 'Social choice seminar room',
      clue: clue('a seminar on collective decisions', 'the seminar room'),
      dialogue: ['Three groups rank three festival sites. Before you count, decide what it means for a group to prefer something.', 'Count first choices, then points, then head-to-head contests. If the answers differ, ask what each rule was quietly assuming.', 'Narrator: Arrow proved that no ranking rule satisfies a short list of reasonable-sounding conditions all at once. The ballots here are invented.'],
      limitation: 'An impossibility result about ideal rules does not make every election arbitrary; real choices trade the conditions off.', transfer: 'Which rule chose the festival site, and would another reasonable rule have moved it?',
      evidence: 'With these ballots the plurality winner, the points winner and the head-to-head contests disagree, and the order of votes decides the outcome.', sourceIds: ['arrow', 'arrow-prize'], prize: '1972, shared with John Hicks; general equilibrium and welfare theory.', theme: 'mediterranean', palette: { wall: '#d2b98a', roof: '#a5553a', grass: '#7b9477' } },
    { id: 21, shortName: 'Hägerstrand', name: 'Torsten Hägerstrand', collaborators: 'Farm households of a fictional parish', campus: 'Lund University', era: '1953', year: 1953,
      title: 'The Spreading Map', method: 'Spatial diffusion & Monte Carlo simulation', objective: 'Find the geography department and let an idea travel across a map.', office: 'Department of Geography',
      clue: clue('a study of how new practices spread between farms', 'the geography department'),
      dialogue: ['People tell their neighbours first. Give each household a small chance of telling someone, falling off quickly with distance.', 'Run the same map several times. The patches differ, but the neighbourhood effect keeps returning. Now put a lake in the way.', 'Narrator: Hägerstrand ran such draws by hand and on an early computer. This grid and its households are new and fictional.'],
      limitation: 'A simulation that resembles the real map shows the mechanism is possible, not that it is the one at work.', transfer: 'Where did news of the festival start, and does the canal work as a barrier to it?',
      evidence: 'Repeated runs produce different patches but the same clustering near early adopters, and a barrier leaves the far side behind.', sourceIds: ['hagerstrand', 'hagerstrand-bib'], theme: 'classical', palette: { wall: '#e4dccb', roof: '#6b7078', grass: '#74994d' } },
    { id: 22, shortName: 'Riker', name: 'William Riker', collaborators: 'A fictional festival council', campus: 'University of Rochester', era: '1962', year: 1962,
      title: 'Just Enough Votes', method: 'Coalitions & positive political theory', objective: 'Find the political science seminar and build the smallest winning coalition.', office: 'Political science seminar room',
      clue: clue('a seminar on coalitions', 'the seminar room'),
      dialogue: ['Five parties share a hundred council seats. Winning needs fifty-one. The prize is fixed, so every extra partner must be paid.', 'Build a coalition that is too large, then trim it. Notice that more than one minimal coalition exists, and who is left out of each.', 'Narrator: Riker’s size principle rests on strict assumptions: a fixed prize and full information. The council here is invented.'],
      limitation: 'Real coalitions are often larger than the minimum, because of uncertainty, shared aims and future bargains.', transfer: 'Which coalition controls the festival committee, and which districts were surplus to it?',
      evidence: 'Several minimal winning coalitions exist in this council; trimming surplus partners raises each member’s share and leaves others out entirely.', sourceIds: ['riker', 'riker-review'], theme: 'brick', palette: { wall: '#a8664c', roof: '#5b5f5c', grass: '#74994d' } },
    { id: 23, shortName: 'Converse', name: 'Philip Converse', collaborators: 'Survey interviewers and a fictional panel', campus: 'University of Michigan', era: '1964', year: 1964,
      title: 'Ask Me Again', method: 'Survey panels & attitude stability', objective: 'Find the survey centre and ask the same question three times.', office: 'Survey Research Center',
      clue: clue('a panel survey', 'the survey centre'),
      dialogue: ['Twelve residents answered the same question in three seasons. Lay the answers side by side before you summarise them.', 'Some answers hold steady. Others change as if by coin. Offer a "no opinion" box and see who takes it.', 'Narrator: Converse argued that many survey answers on policy were not settled attitudes. Others replied that vague questions add noise of their own.'],
      limitation: 'Unstable answers can come from unclear questions and measurement error as well as from absent opinions.', transfer: 'Should Bellwether re-ask its survey, with a no-opinion option, before treating answers as fixed preferences?',
      evidence: 'A stable group answers consistently while another changes at random; a no-opinion option removes much of the apparent instability.', sourceIds: ['converse'], theme: 'brick', palette: { wall: '#b7785a', roof: '#5f5f5a', grass: '#7d8c4f' } },
    { id: 24, shortName: 'Milgram', name: 'Stanley Milgram', collaborators: 'Jeffrey Travers and volunteer letter-carriers', campus: 'Harvard University', era: '1967', year: 1967,
      title: 'Six Handshakes?', method: 'Small-world chains & selection', objective: 'Find the social relations office and send letters through chains of acquaintances.', office: 'Department of Social Relations',
      clue: clue('a letter-forwarding study', 'the department office'),
      dialogue: ['Each volunteer passes the letter to an acquaintance who may be closer to the target. Most letters never arrive.', 'Measure the chains that finished. Then chase the ones that stalled and measure again. Which letters were easier to lose?', 'Narrator: The chains that completed were the short ones. This network and its letters are invented for the lesson.'],
      limitation: 'Completed chains are a selected sample: long chains are more likely to break, so the survivors look shorter than the world is.', transfer: 'Do the festival invitations that arrived tell us about the ones that did not?',
      evidence: 'Counting only completed chains gives a shorter average than following up the stalled ones, because long chains drop out more often.', sourceIds: ['milgram'], theme: 'brick', palette: { wall: '#a96a50', roof: '#626268', grass: '#708568' } },
    { id: 25, shortName: 'Heckman', name: 'James Heckman', collaborators: 'A fictional labour survey', campus: 'University of Chicago', era: '1979', year: 1979,
      title: 'The Ones Who Showed Up', method: 'Selection bias', objective: 'Find the economics workshop and ask who is missing from the data.', office: 'Economics workshop',
      clue: clue('a workshop on labour-market data', 'the workshop'),
      dialogue: ['We observe wages only for people who took a job. Draw the line through those points, then ask who never entered the sample.', 'Reveal the offers nobody accepted. Then use what you know about who works to correct the estimate.', 'Narrator: Heckman treated the missing cases as a modelling problem in its own right. These workers and wages are invented.'],
      limitation: 'The correction leans on assumptions about why people enter the sample; a weak model of selection gives a weak correction.', transfer: 'Who chooses to attend the festival, and how does that choice shape what attendees report?',
      evidence: 'A line fitted only to people who took work misstates the relationship; modelling who enters the sample moves the estimate toward the truth.', sourceIds: ['heckman', 'heckman-prize'], prize: '2000, shared with Daniel McFadden; methods for analysing selective samples.', theme: 'gothic', palette: { wall: '#a9a696', roof: '#6b5a4e', grass: '#e8edea' } },
    { id: 26, shortName: 'Axelrod', name: 'Robert Axelrod', collaborators: 'Tournament entrants', campus: 'University of Michigan', era: '1984 · tournaments from 1980', year: 1984,
      title: 'Tit for Tat at the Fair', method: 'Repeated games & cooperation', objective: 'Find the public policy institute and enter a strategy in the tournament.', office: 'Institute of Public Policy Studies',
      clue: clue('a computer tournament of strategies', 'the institute'),
      dialogue: ['Two stallholders can share customers or poach them, again and again. Choose a rule for one of them and let the rules play each other.', 'A simple rule that starts kindly and answers in kind often does well. Now let hands slip five times in a hundred and watch the feuds.', 'Narrator: Results depend on which strategies enter and on how noisy the world is. These stallholders are fictional.'],
      limitation: 'No strategy wins against every field of opponents, and small error rates change the ranking.', transfer: 'Do Bellwether’s districts deal with each other repeatedly, or only once a year at the gate?',
      evidence: 'A reciprocating strategy scores well in the clean tournament but falls into long feuds once mistakes are possible; a forgiving variant recovers.', sourceIds: ['axelrod'], theme: 'brick', palette: { wall: '#b7785a', roof: '#5f5f5a', grass: '#e8edea' } },
    { id: 27, shortName: 'Card & Krueger', name: 'David Card & Alan Krueger', collaborators: 'Survey callers and two fictional towns', campus: 'Princeton University', era: '1994', year: 1994,
      title: 'Two Towns, One Change', method: 'Natural experiments & difference-in-differences', objective: 'Find the industrial relations office and compare two towns across a rule change.', office: 'Industrial Relations Section',
      clue: clue('a survey of restaurants on both sides of a border', 'the office'),
      dialogue: ['One town changed a rule; its neighbour did not. Compare the change in one with the change in the other.', 'Before and after in one town mixes the rule with everything else that year. Check that the towns moved together before the change.', 'Narrator: The method needs the two places to have been on parallel paths. The original study drew years of debate. These towns are invented.'],
      limitation: 'The comparison is only as good as the assumption that both places would otherwise have moved in parallel.', transfer: 'Is there a district like Eastbank where the gate rule did not change, to compare before and after?',
      evidence: 'Before-and-after in one town and a single-year comparison both mislead here; the difference of the two changes isolates the rule, provided earlier trends were parallel.', sourceIds: ['card-krueger', 'card-prize'], prize: '2021 to David Card, shared with Joshua Angrist and Guido Imbens; Alan Krueger died in 2019.', theme: 'gothic', palette: { wall: '#b9a98a', roof: '#4d544e', grass: '#74994d' } },
    { id: 28, shortName: 'Gerber & Green', name: 'Alan Gerber & Donald Green', collaborators: 'Canvassers and fictional households', campus: 'Yale University', era: '2000 · field experiment of 1998', year: 2000,
      title: 'A Knock on the Door', method: 'Field experiments & non-compliance', objective: 'Find the policy institute and randomise who gets a knock on the door.', office: 'Institution for Social and Policy Studies',
      clue: clue('a door-to-door experiment', 'the institute'),
      dialogue: ['Assign households to a visit by lottery. Many doors will stay shut. Keep everyone in the group they were assigned to.', 'Comparing people who answered with people who did not flatters the visit: those who open doors differ already. Divide the assigned-group gap by the contact rate.', 'Narrator: One city and one election cannot settle how canvassing works everywhere. These households are invented.'],
      limitation: 'The estimate describes people who can be reached at the door in one place and season, not everyone.', transfer: 'Could festival invitations be delivered by lottery, and analysed by who was assigned rather than who answered?',
      evidence: 'Comparing households who answered with those who did not overstates the effect; analysing by random assignment and scaling by the contact rate gives a defensible estimate.', sourceIds: ['gerber-green'], theme: 'gothic', palette: { wall: '#b0a48a', roof: '#565a54', grass: '#7d8c4f' } },
    { id: 29, shortName: 'Piketty', name: 'Thomas Piketty', collaborators: 'Tax-record historians and fictional households', campus: 'Paris School of Economics', era: '2013', year: 2013,
      title: 'When r Outruns g', method: 'Long-run distribution data', objective: 'Find the inequality laboratory and let wealth compound for sixty years.', office: 'World inequality laboratory',
      clue: clue('a long series of tax records', 'the laboratory'),
      dialogue: ['A hundred households earn, save and inherit. Set the return on wealth and the growth of incomes, then let sixty years pass.', 'Watch the share held by the top tenth, not the average. Reverse the two rates. Then try a small annual levy on large fortunes.', 'Narrator: The inequality r > g describes a tendency under stated conditions, not a law. The measurements and their meaning are still argued over.'],
      limitation: 'A toy economy with two rates leaves out shocks, policy and behaviour; the historical series themselves rest on contested estimates.', transfer: 'Who has owned the festival stalls over the years, rather than only who earned most this season?',
      evidence: 'When the return on wealth stays above income growth the top share drifts upward in this model; reversing the rates or adding a levy slows or stops the drift.', sourceIds: ['piketty'], theme: 'classical', palette: { wall: '#d8ccb0', roof: '#6f7780', grass: '#7d8c4f' } },
    { id: 30, shortName: 'Bail', name: 'Chris Bail', collaborators: 'The Polarization Lab team and fictional volunteers', campus: 'Duke University', era: '2018', year: 2018,
      title: 'The Other Side of the Feed', method: 'Online field experiments & polarization', objective: 'Find the Polarization Lab and test what a month of the other side’s messages does.', office: 'Polarization Lab',
      clue: clue('an experiment on social media feeds', 'the lab'),
      dialogue: ['Volunteers from two camps are assigned by lottery to follow an account that relays the other camp’s messages for a month.', 'Compare each camp with its own control group. Check who actually read the messages. Did exposure soften views, or harden them?', 'Narrator: The original study found that exposure could increase polarization for one group. It covered one platform, one country and one month.'],
      limitation: 'One platform and one month; self-reported views; and a kind of exposure that is not the same as conversation.', transfer: 'Would simply showing Eastbank and the festival districts each other’s views help, or should contact be designed and tested?',
      evidence: 'In this experiment exposure to the other camp’s messages did not bring the camps together, and one camp moved further away; the effect was larger among those who read the most.', sourceIds: ['bail'], theme: 'gothic', palette: { wall: '#9a8f7c', roof: '#5a5f5c', grass: '#74994d' } },
  ];
  const NEW_SOURCES = [
    { id: 'lazarsfeld', title: 'Lazarsfeld, Berelson & Gaudet (1944) · The People’s Choice (Britannica entry)', url: 'https://www.britannica.com/topic/The-Peoples-Choice', note: 'Historical anchor: the study of the 1940 presidential election. The town, circles and outcomes in the game are invented.' },
    { id: 'lazarsfeld-two-step', title: 'Two-step flow of communication · overview', url: 'https://en.wikipedia.org/wiki/Two-step_flow_of_communication', note: 'Context for the hypothesis and for later criticism of it.' },
    { id: 'arrow', title: 'Arrow (1951) · Social Choice and Individual Values (Cowles Foundation monograph)', url: 'https://cowles.yale.edu/research/cfm-12-social-choice-and-individual-values', note: 'Historical anchor. The ballots in the game are invented. URL to be confirmed by the owner.' },
    { id: 'arrow-prize', title: 'Nobel Prize · Kenneth J. Arrow, facts', url: 'https://www.nobelprize.org/prizes/economic-sciences/1972/arrow/facts/', note: 'Prize metadata.' },
    { id: 'hagerstrand', title: 'Hägerstrand · Innovation Diffusion as a Spatial Process (1953; English edition 1967), review record', url: 'https://doi.org/10.2307/3101713', note: 'Historical anchor: the Lund doctoral thesis and its Monte Carlo diffusion model. The grid in the game is invented.' },
    { id: 'hagerstrand-bib', title: 'Bibliography of Torsten Hägerstrand, compiled by Bo Lenntorp', url: 'https://www.gu.se/sites/default/files/2023-04/T_Hagerstrand_bibliography_compiled_by_Bo_Lenntorp.pdf', note: 'Lists the 1953 Swedish thesis and its 1967 translation.' },
    { id: 'riker', title: 'Riker (1962) · The Theory of Political Coalitions (overview)', url: 'https://en.wikipedia.org/wiki/The_Theory_of_Political_Coalitions', note: 'Historical anchor: the size principle and minimal winning coalitions. The council in the game is invented.' },
    { id: 'riker-review', title: 'Review of The Theory of Political Coalitions · American Political Science Review 57(2), 1963', url: 'https://doi.org/10.2307/1952835', note: 'Contemporary review of the book.' },
    { id: 'converse', title: 'Converse (1964) · The Nature of Belief Systems in Mass Publics (2006 reprint)', url: 'https://doi.org/10.1080/08913810608443650', note: 'Historical anchor. The panel in the game is invented.' },
    { id: 'milgram', title: 'Travers & Milgram (1969) · An Experimental Study of the Small World Problem', url: 'https://doi.org/10.2307/2786545', note: 'Historical anchor for the letter-forwarding studies begun in 1967. The network in the game is invented. DOI to be confirmed by the owner.' },
    { id: 'heckman', title: 'Heckman (1979) · Sample Selection Bias as a Specification Error', url: 'https://doi.org/10.2307/1912352', note: 'Historical anchor. Workers and wages in the game are invented.' },
    { id: 'heckman-prize', title: 'Nobel Prize · James J. Heckman, facts', url: 'https://www.nobelprize.org/prizes/economic-sciences/2000/heckman/facts/', note: 'Prize metadata.' },
    { id: 'axelrod', title: 'Axelrod (1980) · Effective Choice in the Prisoner’s Dilemma', url: 'https://doi.org/10.1177/002200278002400101', note: 'Historical anchor for the computer tournaments, later described in The Evolution of Cooperation (1984). DOI to be confirmed by the owner.' },
    { id: 'card-krueger', title: 'Card & Krueger (1994) · Minimum Wages and Employment: A Case Study of the Fast-Food Industry in New Jersey and Pennsylvania', url: 'https://www.jstor.org/stable/2118030', note: 'Historical anchor. The towns and figures in the game are invented. Stable URL to be confirmed by the owner.' },
    { id: 'card-prize', title: 'Nobel Prize · David Card, facts', url: 'https://www.nobelprize.org/prizes/economic-sciences/2021/card/facts/', note: 'Prize metadata.' },
    { id: 'gerber-green', title: 'Gerber & Green (2000) · The Effects of Canvassing, Telephone Calls, and Direct Mail on Voter Turnout: A Field Experiment', url: 'https://doi.org/10.2307/2585837', note: 'Historical anchor. Households in the game are invented.' },
    { id: 'piketty', title: 'Piketty · Capital in the Twenty-First Century (2013; English edition 2014)', url: 'https://www.hup.harvard.edu/books/9780674430006', note: 'Historical anchor. The households in the game are invented. Publisher URL to be confirmed by the owner.' },
    { id: 'bail', title: 'Bail et al. (2018) · Exposure to opposing views on social media can increase political polarization', url: 'https://doi.org/10.1073/pnas.1804840115', note: 'Historical anchor. Volunteers and scores in the game are invented.' },
  ];

  // Small touches of character for each scholar's scene (fictional staging, kindly meant).
  const SIGN = {
    1: ['a stack of household schedules', 'checking street numbers against the map'], 2: ['a checkerboard and a jar of coins', 'sliding coins around a board'], 3: ['a wall of index cards joined by string', 'pinning one more card'],
    4: ['a table-top water channel', 'adjusting a tiny sluice gate'], 5: ['a blackboard of arrows', 'redrawing an arrow'], 6: ['a ball of string and many pins', 'adding another node'],
    7: ['a jukebox of unknown songs', 'checking the download counts'], 8: ['a noticeboard of sign-up sheets', 'counting signatures'], 9: ['two piles of newspaper clippings', 'comparing yesterday with today'],
    10: ['a dashboard with one needle stuck', 'tapping the glass'], 11: ['a tray of street photographs', 'reading the timestamps'], 12: ['a codebook with many sticky notes', 'revising a category'],
    13: ['a map of pins that drift', 'nudging two pins apart'], 14: ['a chess clock', 'stopping the clock'], 15: ['two almost identical flyers', 'swapping the flyers'],
    16: ['a tray of envelopes', 'matching envelopes'], 17: ['a bag of lottery tokens', 'drawing a token'], 18: ['a rulebook with a broken lock', 'turning a page'],
    19: ['a radio and a stack of interview cards', 'tuning the radio'], 20: ['three ballot boxes', 'recounting'], 21: ['a parish map and a pair of dice', 'rolling the dice'],
    22: ['a tray of council name-plates', 'moving a name-plate'], 23: ['three seasons of questionnaires', 'laying sheets side by side'], 24: ['a basket of returned letters', 'sorting envelopes'],
    25: ['a scatter of pins with gaps', 'looking for the missing pins'], 26: ['a deck of punch cards', 'shuffling the cards'], 27: ['two town maps and a ruler', 'measuring twice'],
    28: ['a clipboard and a doorbell', 'ticking a list'], 29: ['ledgers two centuries deep', 'turning a ledger'], 30: ['two telephones, face down', 'checking a feed'],
  };

  const all = [...(D.encounters || []), ...NEW].sort((a, b) => a.id - b.id);
  const byId = new Map(all.map((e) => [e.id, e]));
  const sources = [...(D.sources || []), ...NEW_SOURCES];
  const GROUPS = {
    1: ['W. E. B. Du Bois'], 2: ['Thomas Schelling'], 3: ['Mark Granovetter'], 4: ['Elinor Ostrom'], 5: ['Judea Pearl'], 6: ['Albert-László Barabási', 'Réka Albert'],
    7: ['Duncan J. Watts', 'Matthew Salganik', 'Peter Dodds'], 8: ['Damon Centola'], 9: ['Gary King', 'Jennifer Pan', 'Margaret E. Roberts'], 10: ['David Lazer'], 11: ['Timnit Gebru', 'Fei-Fei Li'],
    12: ['Bruce Desmarais'], 13: ['Dino Christenson'], 14: ['Herbert A. Simon'], 15: ['Daniel Kahneman'], 16: ['Alvin E. Roth', 'Lloyd Shapley'], 17: ['Esther Duflo', 'Abhijit Banerjee', 'Michael Kremer'], 18: ['Daron Acemoglu'],
    19: ['Paul Lazarsfeld'], 20: ['Kenneth Arrow'], 21: ['Torsten Hägerstrand'], 22: ['William Riker'], 23: ['Philip Converse'], 24: ['Stanley Milgram'], 25: ['James Heckman'], 26: ['Robert Axelrod'],
    27: ['David Card', 'Alan Krueger'], 28: ['Alan Gerber', 'Donald Green'], 29: ['Thomas Piketty'], 30: ['Chris Bail'],
  };

  SA.Encounters = {
    all, byId, sources, NEW, NEW_SOURCES, GROUPS, SIGN,
    get: (id) => byId.get(Number(id)) || null,
    count: all.length,
    isNew: (id) => Number(id) > 18,
    next: (completed) => all.find((e) => !completed.includes(e.id)) || null,
    sourcesFor: (e) => (e.sourceIds || []).map((id) => sources.find((s) => s.id === id)).filter(Boolean),
    scholars: (id) => GROUPS[id] || [byId.get(Number(id))?.name || 'Researcher'],
  };
})();
