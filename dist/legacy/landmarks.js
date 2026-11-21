/* Sourced architectural anchors; footprints, distances and interiors are gameplay reconstructions.
   Palette values and rendering recipes are original art decisions, not measured building colors. */
(function () {
  'use strict';
  const landmarks = {
    penn: {
      name: 'College Hall', campus: 'University of Pennsylvania', yearBuilt: 1872,
      material: 'Green serpentine stone with contrasting pale trim',
      palette: { wall: '#718370', wallLight: '#92a08a', wallShade: '#4c6255', trim: '#c1bda5', roof: '#555c65', accent: '#8d5742' },
      features: { tower: 'Two unequal end towers for the 1896–97 scene', dome: false, arcade: false, facade: 'Long Gothic/Second Empire body; pointed windows, gables and pale window surrounds', roof: 'Steep slate-like roofs and prominent gabled cross sections' },
      recipe: 'Long green-stone three-storey hall, light stone window lintels, steep dark roof, end towers with pyramidal/mansard caps; pointed central portal. Add fieldwork rowhouses as a separate Philadelphia neighborhood scene.',
      settingNote: 'Constructed 1871–72; both original end towers belong in 1896–97 and were removed in 1914. College Hall is a campus landmark, not a claim that Du Bois held a permanent Penn professorship or an office here. Routes to the Seventh Ward are fictional compressions.',
      sources: [
        { title: 'Penn Archives: College Hall Portico', url: 'https://archives.upenn.edu/exhibits/penn-history/university-china/wedgwood-plates-1940/college-hall-portico/' },
        { title: 'Penn Facilities: College Hall', url: 'https://facilities.upenn.edu/maps/locations/college-hall' }
      ]
    },
    harvard: {
      name: 'Widener Library and Memorial Hall', campus: 'Harvard University', yearBuilt: 1915,
      material: 'Widener: red brick and pale classical stone; Memorial: patterned red brick and stone',
      palette: { wall: '#a96a50', wallLight: '#c48b6b', wallShade: '#764b3d', trim: '#d9cbb1', roof: '#626268', accent: '#7d2c30' },
      features: { tower: 'Memorial Hall: truncated in 1974; full pyramidal upper tower for 2006 onward', dome: false, arcade: false, facade: 'Widener: grand pale columned portico and broad staircase, red-brick wings', roof: 'Widener low roof; Memorial steep patterned roof and Gothic gables' },
      recipe: 'Anchor the south side of the lawn with a wide brick library, central pedimented stone portico, six-to-eight visible columns and broad stairs. Add a separate red Gothic hall to the north. Render its upper pyramidal tower only when the scene year is at least 1999.',
      settingNote: 'Widener opened in 1915. Memorial Hall was completed in stages through 1878. Its upper tower burned in 1956 and was rebuilt in 1999, so the 1974 Harvard visits must show the truncated tower. Modern office interiors and campus distances remain reconstructions.',
      sources: [
        { title: 'Harvard Library: About Widener Library', url: 'https://library.harvard.edu/libraries/widener/about' },
        { title: 'Harvard Memorial Hall: The Tower', url: 'https://websites.harvard.edu/memhall/home-2/buildings/memorial-hall-tower/' },
        { title: 'Harvard Memorial Hall: History', url: 'https://websites.harvard.edu/memhall/home-2/buildings/history/' }
      ]
    },
    indiana: {
      name: 'Sample Gates and Old Crescent', campus: 'Indiana University Bloomington', yearBuilt: 1987,
      material: 'Pale Indiana limestone, wooded lawns and brick paths',
      palette: { wall: '#b6b09a', wallLight: '#d9d2bb', wallShade: '#8d8c7d', trim: '#e3d8bd', roof: '#655f57', accent: '#8a2e36' },
      features: { tower: 'Two low Gothic gateway piers with small pointed caps', dome: false, arcade: 'Open pedestrian gateway between paired piers and low walls', facade: 'Limestone Gothic academic buildings around a wooded crescent', roof: 'Steep dark roofs and modest gables' },
      recipe: 'Use a paired pale-stone gateway with four small finials and a clear central pedestrian opening, a brick walk beyond it and dense mature trees. Low limestone academic buildings frame lawns. The Workshop office is a reconstructed separate destination.',
      settingNote: 'Sample Gates were dedicated in June 1987 and are appropriate for the circa-1990 encounter. They must not appear in a scene set before 1987.',
      sources: [
        { title: 'Indiana University: Behind the Gates', url: 'https://www.myiu.org/news-stories/behind-the-gates.html' },
        { title: 'IU Libraries: Making Indiana University, chapter seven', url: 'https://iulibrariespublishing.iu.edu/making-IU/seven.html' }
      ]
    },
    ucla: {
      name: 'Royce Hall', campus: 'University of California, Los Angeles', yearBuilt: 1929,
      material: 'Warm brick, contrasting stone bands and terracotta roof tile',
      palette: { wall: '#b66f50', wallLight: '#d3916c', wallShade: '#874b39', trim: '#dcc6a3', roof: '#ae5d3e', accent: '#4a785d' },
      features: { tower: 'Distinctive paired square Romanesque bell towers', dome: false, arcade: 'Ground-floor row of rounded arches', facade: 'Asymmetrical twin-tower silhouette, layered brickwork, large arched openings', roof: 'Low red tiled roofs; shallow pyramidal tower caps' },
      recipe: 'Long low warm-brick body with a shaded round-arch entrance arcade; two tall square towers at the front, unequal/open belfry details, pale horizontal stone bands, red tile roofs. Keep adjacent buildings low around the central court.',
      settingNote: 'Royce opened in 1929 and anchors the 1995 and 2013 UCLA scenes. This landmark is not asserted to house the scholars’ real offices.',
      sources: [
        { title: 'UCLA: The Secret Lives of Campus Buildings', url: 'https://newsroom.ucla.edu/magazine/campus-buildings-secrets-royce-hall' },
        { title: 'Royce Hall: History', url: 'https://roycehall.org/about/history/' }
      ]
    },
    notreDame: {
      name: 'Main Building and Golden Dome', campus: 'University of Notre Dame', yearBuilt: 1879,
      material: 'Buff/yellow brick with pale trim and a gilded central dome',
      palette: { wall: '#baa37a', wallLight: '#dbc797', wallShade: '#8b795c', trim: '#e2d4b2', roof: '#59686b', accent: '#d7ac3c' },
      features: { tower: 'Raised central drum beneath the dome', dome: 'Large gold dome topped by a small statue silhouette', arcade: false, facade: 'Broad symmetrical five-storey hall with projecting center and side wings', roof: 'Dark mansard-like roof with dormer details' },
      recipe: 'Use a broad buff-brick hall, dark mansard roof and central gold hemisphere on a tall pale drum; tiny statue above dome, central entrance stairs and straight approach lawn. Preserve the dome as the strongest campus silhouette.',
      settingNote: 'Main Building dates to 1879. University accounts differ on the dome’s exact 1882/83 completion sequence; first gilding was in 1886. All are safely earlier than the 1999 encounter.',
      sources: [
        { title: 'Notre Dame Hospitality: Main Building', url: 'https://hospitality.nd.edu/explore/main-building/' },
        { title: 'Notre Dame: Raised High on a Dome', url: 'https://www.nd.edu/stories/golden-hour/raised-high-on-a-dome/' }
      ]
    },
    columbia: {
      name: 'Low Memorial Library', campus: 'Columbia University', yearBuilt: 1897,
      material: 'Pale limestone and granite classical masonry',
      palette: { wall: '#b7ac94', wallLight: '#ddd1b9', wallShade: '#8d8779', trim: '#e4d8c0', roof: '#7f8a83', accent: '#8a674b' },
      features: { tower: false, dome: 'Broad shallow Pantheon-inspired dome on an octagonal drum', arcade: false, facade: 'Deep classical portico with tall columns and an attic band', roof: 'Low dome above blocky symmetrical wings' },
      recipe: 'Center a pale stone building above a wide multi-flight staircase: ten-column portico may simplify to six visible columns, rectangular attic, octagonal drum and low wide dome. Terrace lawn and neighboring red-brick academic blocks establish Morningside Heights.',
      settingNote: 'Constructed 1895–97. Signature exterior is appropriate for 2006; building interior and playable relative distances are reconstructed.',
      sources: [
        { title: 'Columbia News: Six Secrets of Low Library', url: 'https://news.columbia.edu/news/six-secrets-low-library' },
        { title: 'Columbia College Today: Low Library anniversary', url: 'https://www.college.columbia.edu/cct/sites/default/files/pdf/CCT_Spring%3ASummer_2022_vWEB.pdf' }
      ]
    },
    mit: {
      name: 'Great Dome, Building 10', campus: 'Massachusetts Institute of Technology', yearBuilt: 1916,
      material: 'Pale limestone and concrete, classical academic facades',
      palette: { wall: '#b8b9aa', wallLight: '#dedcc7', wallShade: '#868e83', trim: '#e5e0cb', roof: '#8b978f', accent: '#824538' },
      features: { tower: false, dome: 'Large ribbed pale dome above a high circular drum', arcade: false, facade: 'Symmetrical low academic wings with a tall columned central portico', roof: 'Flat/low wings around the domed center' },
      recipe: 'Broad pale central academic block with a tall columned portico, cylindrical drum, clean domed cap and long horizontal wings, set behind a large open lawn. Avoid copying Notre Dame’s gilding or Low Library’s broad shallow dome.',
      settingNote: 'The Great Dome was constructed in 1916 and suits MIT’s 2010, 2019 and 2024 visits. Office destinations and routes are designed reconstructions.',
      sources: [
        { title: 'MIT Capital Projects: Great Dome renovation, Building 10', url: 'https://capitalprojects.mit.edu/projects/great-dome-building-10' }
      ]
    },
    northeastern: {
      name: 'Richards Hall and Krentzman Quadrangle', campus: 'Northeastern University', yearBuilt: 1938,
      material: 'Light/white brick, restrained pale trim and large rectangular windows',
      palette: { wall: '#c6c1ab', wallLight: '#e1dac4', wallShade: '#929486', trim: '#eee4ce', roof: '#68716b', accent: '#a43f3e' },
      features: { tower: false, dome: false, arcade: false, facade: 'Modernized neoclassical symmetry; broad rectangular light-brick masses and orderly window bays', roof: 'Flat parapet; no Gothic pinnacles' },
      recipe: 'Create an urban quad enclosed by cream-brick rectangular academic blocks, flat parapets, evenly spaced tall windows and a modest classical central entrance. Add street/transit edge and denser city framing; avoid a medieval tower or rural estate.',
      settingNote: 'Richards Hall opened in 1938. This compact Boston research scene represents Northeastern/Harvard context for the 2014 teaching encounter, rather than asserting a documented office interior.',
      sources: [
        { title: 'Northeastern School of Architecture: 2011 Program Report', url: 'https://camd.northeastern.edu/wp-content/uploads/2018/08/NAAB_2011_APR_NortheasternUniversitySoA_FINAL.pdf' },
        { title: 'Northeastern University History', url: 'https://nuhistory.library.northeastern.edu/' }
      ]
    },
    stanford: {
      name: 'Main Quad and Memorial Church', campus: 'Stanford University', yearBuilt: 1903,
      material: 'Warm local sandstone, red clay tile and continuous shaded arcades',
      palette: { wall: '#c9ac7e', wallLight: '#e3c899', wallShade: '#9a805c', trim: '#e9d3ae', roof: '#b06043', accent: '#52705c' },
      features: { tower: 'No pre-1906 steeple in the 2013/2017 scenes', dome: false, arcade: 'Linked single-storey round-arched sandstone arcades framing a quadrangle', facade: 'Memorial Church: ornate gabled front with a warm mosaic panel and three arched entry portals', roof: 'Low red tile roofs; church gable without the lost steeple' },
      recipe: 'Build a wide sandstone quadrangle with many repeating rounded arcade openings and shallow red tile roofs. At its far side add the church’s gabled mosaic facade, rose/round window and three dark portals; do not add the 1903 steeple.',
      settingNote: 'Main Quad opened in 1891, Memorial Church in 1903. The church steeple fell in 1906 and was not rebuilt, so it is absent in both modern encounters.',
      sources: [
        { title: 'Stanford Office for Religious & Spiritual Life: Memorial Church', url: 'https://orsl.stanford.edu/memorial-church' },
        { title: 'Stanford 1906 Earthquake: Evolution of Engineering Methods', url: 'https://quake06.stanford.edu/5-evolution-engineering-methods' }
      ]
    },
    pennState: {
      name: 'Old Main', campus: 'Pennsylvania State University', yearBuilt: 1930,
      material: 'Locally quarried pale limestone and dark roof',
      palette: { wall: '#b6b6a5', wallLight: '#dad9c2', wallShade: '#878c7d', trim: '#e4ddc6', roof: '#535e5c', accent: '#586e83' },
      features: { tower: 'Central square clock tower topped by an open lantern/cupola', dome: false, arcade: false, facade: 'Federal Revival hall with eight monumental front columns and symmetrical wings', roof: 'Low dark roof, central bell-tower lantern' },
      recipe: 'Render a broad pale limestone front, prominent eight-column portico, square clock tower above the center and an open lantern cap. Place behind a wide sloping lawn. Differentiate from Harvard with its clock tower and from MIT with no large dome.',
      settingNote: 'Current Old Main replaced the original building in 1930 (some Penn State retrospective accounts give 1931). Both dates precede 2026. The reconstructed Desmarais office is separate from this landmark.',
      sources: [
        { title: 'Penn State: The Old Main bell tower', url: 'https://www.psu.edu/news/campus-life/story/old-main-bell-tower' },
        { title: 'Penn State Agricultural Sciences: Constructing the Main Building', url: 'https://agsci.psu.edu/about/history/constructing-the-main-building' }
      ]
    },
    washu: {
      name: 'Brookings Hall', campus: 'Washington University in St. Louis', yearBuilt: 1902,
      material: 'Missouri red granite with pale limestone trim, dark slate roof',
      palette: { wall: '#9c776c', wallLight: '#bd9381', wallShade: '#705954', trim: '#d8cbb1', roof: '#53635d', accent: '#a4453d' },
      features: { tower: 'Large square central Gothic gateway tower with corner turrets', dome: false, arcade: 'Tall pointed central passage through the tower', facade: 'Long symmetrical Collegiate Gothic wings, gabled ends, pale trim and grouped windows', roof: 'Steep dark slate gables and crenellated central tower' },
      recipe: 'Set a wide red-granite hall above a terraced lawn, with a large central square tower, four small corner turrets, pale tracery windows and a dark pointed passage. Long gabled wings make a gateway silhouette rather than separate twin bell towers.',
      settingNote: 'Completed in 1902 as University Hall; appropriate for the 2026 WashU encounter. Office and traversal geometry are gameplay reconstructions, not a campus navigation service.',
      sources: [
        { title: 'Washington University Magazine, Spring 1993: Brookings and campus architecture', url: 'https://becker.wustl.edu/static-files/arb/007-RG031-S25-WUmagazine/RG031-S25-V63-N01-Spring-1993.pdf' }
      ]
    },
    cmu: {
      name: 'Hamerschlag Hall', campus: 'Carnegie Mellon University', yearBuilt: 1913,
      material: 'Yellow/tan brick, terra-cotta details and dark metal roof',
      palette: { wall: '#c3ab7e', wallLight: '#e0c894', wallShade: '#97805d', trim: '#d7ba8e', roof: '#586b61', accent: '#825c45' },
      features: { tower: 'Tall cylindrical/rounded industrial tower with an open arcade crown', dome: 'Small dark cap above a circular tower, not a large library dome', arcade: 'Repeated arched openings at the tower crown', facade: 'Industrial Beaux Arts brick academic wings with large tall windows', roof: 'Dark hipped/gabled metal roof and rounded tower cap' },
      recipe: 'Use yellow-brick industrial academic wings, generous vertical windows, terracotta bands and a distinctive round/tall tower crowned by an open ring of arches and dark cap. Place on an edge overlooking a hollow rather than on a flat medieval courtyard.',
      settingNote: 'University Archives date construction to 1912–13. The distinctive tower originally concealed a smokestack. Omit the 1997 Intelligent Workplace addition for Simon’s 1978 scene.',
      sources: [
        { title: 'CMU Archives: Physical Plant Records', url: 'https://findingaids.library.cmu.edu/repositories/2/resources/95' },
        { title: 'CMU 2022 Institutional Master Plan building inventory', url: 'https://www.cmu.edu/cdfd/process/master-plan/pdf/nov-2022-cmu-institutional-master-plan-appendix.pdf' }
      ]
    },
    princeton: {
      name: 'Nassau Hall', campus: 'Princeton University', yearBuilt: 1756,
      material: 'Gray-brown local sandstone, slate roof and pale cupola',
      palette: { wall: '#a79d83', wallLight: '#c5baa0', wallShade: '#7b7866', trim: '#d9cead', roof: '#555e61', accent: '#71948a' },
      features: { tower: 'Modest central clock cupola with open lantern and weather vane', dome: 'Small weathered copper cupola cap', arcade: false, facade: 'Long three-storey Georgian stone hall, regular windows, central entrance', roof: 'Dark hipped slate roof; no tall flanking Italianate towers in 2002' },
      recipe: 'Long sandstone rectangle with repetitive sash windows, slightly projecting central portal, dark hipped roof and a modest pale clock/lantern cupola. Use weathered turquoise-green copper on its small cap for 2002; add low ivy at the walls and two small tiger sculptures beside entry steps.',
      settingNote: 'Opened in 1756 and altered repeatedly after fires. Later changes removed the large flanking towers. The 2018–19 bright new copper restoration must not appear in the 2002 encounter.',
      sources: [
        { title: 'Princeton University Archives: Architecture of Nassau Hall', url: 'https://universityarchives.princeton.edu/2015/06/a-brief-history-of-the-architecture-of-nassau-hall/' },
        { title: 'Princeton: Renovated cupola and roof crown Nassau Hall', url: 'https://www.princeton.edu/news/2019/01/17/look-renovated-cupola-and-roof-crown-princetons-nassau-hall' }
      ]
    }
  };
  const keys = ['penn', 'harvard', 'harvard', 'indiana', 'ucla', 'notreDame', 'columbia', 'mit', 'harvard', 'northeastern', 'stanford', 'pennState', 'washu', 'cmu', 'princeton', 'stanford', 'mit', 'mit'];
  landmarks.byEncounter = Object.fromEntries(keys.map((key, i) => [i + 1, landmarks[key]]));
  landmarks.secondaryByEncounter = { 16: landmarks.ucla, 17: landmarks.harvard };
  landmarks.disclaimer = 'Signature architecture is source-informed; original simplified rendering, campus distances, paths, gateway links and all office interiors are fictional gameplay reconstructions.';
  window.CAMPUS_LANDMARKS = landmarks;
})();
