// ---------- Icônes ----------
// Un seul jeu d'icônes (traits arrondis, currentColor) pour tous les boutons générés dynamiquement,
// cohérent avec celles écrites en dur dans index.html (même style : viewBox 24, trait 2, coins ronds).
const ICONS = {
    plus: '<path d="M12 5v14M5 12h14"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    close: '<path d="M18 6 6 18"/><path d="M6 6l12 12"/>',
    pencil: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
    duplicate: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',
    trash: '<path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>',
    up: '<path d="M12 19V5"/><path d="m5 12 7-7 7 7"/>',
    down: '<path d="M12 5v14"/><path d="m5 12 7 7 7-7"/>',
    'chevron-left': '<path d="m15 18-6-6 6-6"/>',
    'chevron-right': '<path d="m9 18 6-6-6-6"/>',
    loop: '<path d="M17 2 21 6 17 10"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 22 3 18 7 14"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>',
    play: '<path d="M8 5v14l11-7z" fill="currentColor" stroke="none"/>',
    stop: '<rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" stroke="none"/>'
};

// Rendu HTML d'une icône (name doit exister dans ICONS) ; extraClass optionnel pour la taille/marge
// via CSS (voir .icon dans style.css). aria-hidden car ces icônes sont toujours à côté d'un texte,
// d'un title ou d'un aria-label déjà porté par leur bouton parent.
function svgIcon(name, extraClass) {
    return `<svg class="icon${extraClass ? ' ' + extraClass : ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;
}

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
// Équivalents enharmoniques en bémols, utilisés à l'affichage pour les tonalités qui s'écrivent ainsi
const NOTES_FLAT = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'];


// Intervalles de chaque type d'accord, partagés entre la classe Chord (voicing/lecture), le
// repérage hors-tonalité et l'orthographe enharmonique fonctionnelle. Pour chaque note :
//   - semi   : demi-tons depuis la fondamentale (au-delà de 12 pour les extensions 9e/11e/13e ;
//              la classe Chord ne s'en soucie pas, simple arithmétique MIDI) ;
//   - degree : distance en « lettres » depuis la fondamentale (0=fondamentale, 1=2de/9e, 2=tierce,
//              3=4te/11e, 4=quinte, 5=6te/13e, 6=7me) — sert à l'orthographe fonctionnelle, pour
//              qu'une tierce s'écrive toujours avec la bonne lettre (ex. Fa# et non Sol♭ sur un Ré) ;
//   - role   : catégorie de coloration du clavier (root/third/fifth/seventh/ext).
// Voicings dom11/dom13 : on omet respectivement la tierce (choc avec la 11e) et la quinte + la 11e
// (notes les moins essentielles), comme c'est l'usage courant en jazz.
const CHORD_INTERVALS = {
    maj:  [{ semi: 0, degree: 0, role: 'root' }, { semi: 4, degree: 2, role: 'third' }, { semi: 7, degree: 4, role: 'fifth' }],
    min:  [{ semi: 0, degree: 0, role: 'root' }, { semi: 3, degree: 2, role: 'third' }, { semi: 7, degree: 4, role: 'fifth' }],
    maj7: [{ semi: 0, degree: 0, role: 'root' }, { semi: 4, degree: 2, role: 'third' }, { semi: 7, degree: 4, role: 'fifth' }, { semi: 11, degree: 6, role: 'seventh' }],
    min7: [{ semi: 0, degree: 0, role: 'root' }, { semi: 3, degree: 2, role: 'third' }, { semi: 7, degree: 4, role: 'fifth' }, { semi: 10, degree: 6, role: 'seventh' }],
    dom7: [{ semi: 0, degree: 0, role: 'root' }, { semi: 4, degree: 2, role: 'third' }, { semi: 7, degree: 4, role: 'fifth' }, { semi: 10, degree: 6, role: 'seventh' }],
    // Le 2e/4e degré qui remplace la tierce n'EST pas une tierce (voir légende 1/3/5/7/Autres) :
    // classé « ext » comme les autres degrés hors 1-3-5-7 (2, 4, 6, 9, 11, 13...).
    sus2: [{ semi: 0, degree: 0, role: 'root' }, { semi: 2, degree: 1, role: 'ext' }, { semi: 7, degree: 4, role: 'fifth' }],
    sus4: [{ semi: 0, degree: 0, role: 'root' }, { semi: 5, degree: 3, role: 'ext' }, { semi: 7, degree: 4, role: 'fifth' }],
    '6':  [{ semi: 0, degree: 0, role: 'root' }, { semi: 4, degree: 2, role: 'third' }, { semi: 7, degree: 4, role: 'fifth' }, { semi: 9, degree: 5, role: 'ext' }],
    m6:   [{ semi: 0, degree: 0, role: 'root' }, { semi: 3, degree: 2, role: 'third' }, { semi: 7, degree: 4, role: 'fifth' }, { semi: 9, degree: 5, role: 'ext' }],
    dim:  [{ semi: 0, degree: 0, role: 'root' }, { semi: 3, degree: 2, role: 'third' }, { semi: 6, degree: 4, role: 'fifth' }],
    dim7: [{ semi: 0, degree: 0, role: 'root' }, { semi: 3, degree: 2, role: 'third' }, { semi: 6, degree: 4, role: 'fifth' }, { semi: 9, degree: 6, role: 'seventh' }],
    m7b5: [{ semi: 0, degree: 0, role: 'root' }, { semi: 3, degree: 2, role: 'third' }, { semi: 6, degree: 4, role: 'fifth' }, { semi: 10, degree: 6, role: 'seventh' }],
    aug:  [{ semi: 0, degree: 0, role: 'root' }, { semi: 4, degree: 2, role: 'third' }, { semi: 8, degree: 4, role: 'fifth' }],
    add9: [{ semi: 0, degree: 0, role: 'root' }, { semi: 4, degree: 2, role: 'third' }, { semi: 7, degree: 4, role: 'fifth' }, { semi: 14, degree: 1, role: 'ext' }],
    // add11 : garde la tierce (contrairement à dom11, qui l'omet) puisqu'il n'y a pas de 7e pour
    // épaissir le mélange tierce/11e — 11e placée au-dessus de l'octave, comme la 9e d'add9.
    add11: [{ semi: 0, degree: 0, role: 'root' }, { semi: 4, degree: 2, role: 'third' }, { semi: 7, degree: 4, role: 'fifth' }, { semi: 17, degree: 3, role: 'ext' }],
    maj9: [{ semi: 0, degree: 0, role: 'root' }, { semi: 4, degree: 2, role: 'third' }, { semi: 7, degree: 4, role: 'fifth' }, { semi: 11, degree: 6, role: 'seventh' }, { semi: 14, degree: 1, role: 'ext' }],
    m9:   [{ semi: 0, degree: 0, role: 'root' }, { semi: 3, degree: 2, role: 'third' }, { semi: 7, degree: 4, role: 'fifth' }, { semi: 10, degree: 6, role: 'seventh' }, { semi: 14, degree: 1, role: 'ext' }],
    dom9: [{ semi: 0, degree: 0, role: 'root' }, { semi: 4, degree: 2, role: 'third' }, { semi: 7, degree: 4, role: 'fifth' }, { semi: 10, degree: 6, role: 'seventh' }, { semi: 14, degree: 1, role: 'ext' }],
    // dom11 : tierce omise (dissonance de seconde avec la 11e)
    dom11: [{ semi: 0, degree: 0, role: 'root' }, { semi: 7, degree: 4, role: 'fifth' }, { semi: 10, degree: 6, role: 'seventh' }, { semi: 14, degree: 1, role: 'ext' }, { semi: 17, degree: 3, role: 'ext' }],
    // dom13 : quinte et 11e omises (notes les moins essentielles de l'accord)
    dom13: [{ semi: 0, degree: 0, role: 'root' }, { semi: 4, degree: 2, role: 'third' }, { semi: 10, degree: 6, role: 'seventh' }, { semi: 14, degree: 1, role: 'ext' }, { semi: 21, degree: 5, role: 'ext' }]
};

// Symboles d'accord lisibles pour l'affichage
const QUALITY_LABEL = {
    maj: '', min: 'm', maj7: 'maj7', min7: 'm7', dom7: '7',
    sus2: 'sus2', sus4: 'sus4', '6': '6', m6: 'm6',
    dim: 'dim', dim7: 'dim7', m7b5: 'm7b5', aug: 'aug',
    add9: 'add9', add11: 'add11', maj9: 'maj9', m9: 'm9', dom9: '9', dom11: '11', dom13: '13'
};

// ---------- Saisie rapide au clavier (grille) ----------
// Alias reconnus pour chaque qualité, clé = suffixe normalisé (espaces retirés, en minuscules) une
// fois la fondamentale extraite. "m"/"min" = mineur (convention universelle) ; le majeur ne
// s'abrège JAMAIS en un simple "M" à ce stade (voir plus bas, traité séparément AVANT la mise en
// minuscule) pour éviter la confusion avec "m" (mineur) une fois tout passé en minuscules.
const QUALITY_ALIASES = {
    '': 'maj', 'maj': 'maj', 'ma': 'maj', 'major': 'maj',
    'm': 'min', 'min': 'min', 'mi': 'min', 'minor': 'min', '-': 'min',
    '7': 'dom7', 'dom7': 'dom7',
    'maj7': 'maj7', 'ma7': 'maj7',
    'm7': 'min7', 'min7': 'min7', 'mi7': 'min7', '-7': 'min7',
    'sus2': 'sus2',
    'sus4': 'sus4', 'sus': 'sus4',
    '6': '6',
    'm6': 'm6', 'min6': 'm6', '-6': 'm6',
    'dim': 'dim', '°': 'dim', 'o': 'dim',
    'dim7': 'dim7', '°7': 'dim7', 'o7': 'dim7',
    'm7b5': 'm7b5', 'm7-5': 'm7b5', 'min7b5': 'm7b5', 'ø': 'm7b5', 'ø7': 'm7b5', 'halfdim': 'm7b5', 'halfdim7': 'm7b5',
    'aug': 'aug', '+': 'aug',
    'add9': 'add9',
    'add11': 'add11',
    'maj9': 'maj9', 'ma9': 'maj9',
    'm9': 'm9', 'min9': 'm9',
    '9': 'dom9', 'dom9': 'dom9',
    '11': 'dom11', 'dom11': 'dom11',
    '13': 'dom13', 'dom13': 'dom13',
};

// Parse un symbole d'accord tapé au clavier (ex. "Cm7", "F#dim", "Bbadd9", "DM7") en { root, quality
// } exploitable par Chord, ou null si non reconnu. Toujours en position fondamentale : la saisie
// rapide sert à poser vite une grille, pas à régler un voicing précis (renversement/drop/basse
// restent modifiables ensuite en double-cliquant la case, comme n'importe quel accord).
function parseChordSymbol(input) {
    const s = (input || '').trim();
    if (!s) return null;
    const m = s.match(/^([A-Ga-g])(#|b)?(.*)$/);
    if (!m) return null;
    const [, letter, accidental, rawRest] = m;

    const BASE_PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
    let pc = BASE_PC[letter.toUpperCase()];
    if (accidental === '#') pc += 1;
    else if (accidental === 'b') pc -= 1;
    pc = ((pc % 12) + 12) % 12;
    const root = NOTES[pc];

    const rest = rawRest.trim();
    // Convention jazz répandue : M/M7/M9 en MAJUSCULE = majeur — vérifié avant la normalisation en
    // minuscules (sinon "M7" serait confondu avec "m7", mineur 7e).
    if (rest === 'M') return { root, quality: 'maj' };
    if (rest === 'M7') return { root, quality: 'maj7' };
    if (rest === 'M9') return { root, quality: 'maj9' };

    const suffix = rest.replace(/\s+/g, '').toLowerCase();
    const quality = QUALITY_ALIASES[suffix];
    return quality ? { root, quality } : null;
}

// Tonalités majeures qui s'écrivent conventionnellement avec des bémols (Db, Eb, F, Ab, Bb) :
// moins d'altérations que leur équivalent en dièses (ex. Db = 5b vs C# = 7#). Toutes les autres
// tonalités majeures (C, G, D, A, E, B, F#) s'écrivent avec des dièses.
const FLAT_KEY_PCS = new Set([1, 3, 5, 8, 10]);

// ---------- Modes ----------
// Les 7 modes diatoniques ne sont que des rotations de la gamme majeure, chacun démarrant sur un
// degré différent de celui-ci — d'où deux tables dérivées mécaniquement l'une de l'autre :
//   - MODE_SCALES : les degrés (demi-tons depuis la tonique DU MODE) de chaque mode.
//   - MODE_RELATIVE_MAJOR_OFFSET : le décalage (en demi-tons) entre la tonique du mode et celle de
//     SA relative majeure (même armure, mêmes notes) — sert à réutiliser FLAT_KEY_PCS pour
//     déterminer si le mode s'écrit en dièses ou en bémols (ex. do dorien -> sib majeur, relative,
//     s'écrit en bémols -> do dorien aussi).
const MODE_SCALES = {
    maj: [0, 2, 4, 5, 7, 9, 11],        // Ionien
    dorian: [0, 2, 3, 5, 7, 9, 10],
    phrygian: [0, 1, 3, 5, 7, 8, 10],
    lydian: [0, 2, 4, 6, 7, 9, 11],
    mixolydian: [0, 2, 4, 5, 7, 9, 10],
    min: [0, 2, 3, 5, 7, 8, 10],        // Éolien
    locrian: [0, 1, 3, 5, 6, 8, 10]
};
const MODE_RELATIVE_MAJOR_OFFSET = { maj: 0, dorian: 10, phrygian: 8, lydian: 7, mixolydian: 5, min: 3, locrian: 1 };
const MODE_LABELS = { maj: 'majeur', min: 'mineur', dorian: 'dorien', phrygian: 'phrygien', lydian: 'lydien', mixolydian: 'mixolydien', locrian: 'locrien' };

// La relative majeure d'un mode emprunte son armure (voir MODE_RELATIVE_MAJOR_OFFSET ci-dessus)
function useFlatsForKey(rootPc, mode) {
    const majorPc = (rootPc + (MODE_RELATIVE_MAJOR_OFFSET[mode] ?? 0)) % 12;
    return FLAT_KEY_PCS.has(((majorPc % 12) + 12) % 12);
}

// Nom de note pour une classe de hauteur (0-11), en dièses ou en bémols selon la tonalité
function noteNameForPc(pc, useFlats) {
    const i = ((pc % 12) + 12) % 12;
    return (useFlats ? NOTES_FLAT : NOTES)[i];
}

// Nom de note affichable (avec octave) pour un numéro MIDI, selon la tonalité
function midiToDisplayName(midi, useFlats) {
    const pc = ((midi % 12) + 12) % 12;
    const oct = Math.floor(midi / 12) - 1;
    return noteNameForPc(pc, useFlats) + oct;
}

// ---------- Orthographe enharmonique FONCTIONNELLE (par degré, indépendante de la tonalité) ----------
// Une tierce s'écrit toujours avec la lettre une tierce au-dessus de la fondamentale (ex. Fa# sur
// un Ré, jamais Sol♭), même si la tonalité du morceau s'écrit en bémols. Seule la fondamentale
// elle-même suit encore la convention dièses/bémols de la tonalité (c'est le point de départ).
const LETTER_ORDER = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const LETTER_NATURAL_PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

// Décompose un nom de note (« F# », « Bb », « D♭♭ »...) en lettre + décalage d'altération (nombre
// entier de # ou de b/♭, positif ou négatif)
function parseNoteSpelling(name) {
    const letter = name[0];
    let accidental = 0;
    for (let i = 1; i < name.length; i++) {
        if (name[i] === '#') accidental += 1;
        else if (name[i] === 'b' || name[i] === '♭') accidental -= 1;
    }
    return { letter, accidental };
}

// Épelle la lettre+altération à `degreeSteps` lettres au-dessus de `rootLetter` de façon à obtenir
// la classe de hauteur `targetPc` (ex. degree=2 (tierce) depuis Ré, visant Fa# -> "F#").
// Renvoie null si ça exigerait plus qu'un double dièse/bémol (cas extrême, on retombe alors sur
// l'orthographe générique dièse/bémol de la tonalité).
function spellByDegree(rootLetter, degreeSteps, targetPc) {
    const rootLetterIdx = LETTER_ORDER.indexOf(rootLetter);
    const targetLetter = LETTER_ORDER[(rootLetterIdx + degreeSteps) % 7];
    const naturalPc = LETTER_NATURAL_PC[targetLetter];
    let diff = (((targetPc - naturalPc) % 12) + 12) % 12; // ramené dans [0, 11]
    if (diff > 6) diff -= 12;                              // puis dans [-5, 6] (signé, le plus court chemin)
    if (diff < -2 || diff > 2) return null;                // au-delà du double dièse/bémol : abandon
    let sym = targetLetter;
    if (diff === 1) sym += '#';
    else if (diff === 2) sym += '##';
    else if (diff === -1) sym += '♭';
    else if (diff === -2) sym += '♭♭';
    return { letter: targetLetter, accidental: diff, name: sym };
}

// Octave affichée : les numéros d'octave changent à Do (C), pas à chaque lettre. Si on épelle une
// hauteur en "Cb"/"Cbb" (juste sous un Do), ou en "B#"/"B##" (juste au-dessus d'un Si), l'octave
// affichée doit suivre la lettre choisie plutôt que le calcul brut à partir du numéro MIDI.
function displayOctaveFor(letter, accidental, rawOctave) {
    if (letter === 'C' && accidental < 0) return rawOctave + 1;
    if (letter === 'B' && accidental > 0) return rawOctave - 1;
    return rawOctave;
}

// Épelle une note d'accord par sa FONCTION (degré depuis la fondamentale du même accord), avec
// repli sur l'orthographe générique dièse/bémol de la tonalité si le degré est extrême (>2 alt.)
// ou non fourni (notes hors accord, ex. clavier générique). `withOctave=false` omet le chiffre
// d'octave (utile pour un simple récapitulatif des notes, où il n'apporte pas grand-chose).
function spellChordTone(rootPc, useFlats, degree, targetMidi, withOctave = true) {
    const targetPc = ((targetMidi % 12) + 12) % 12;
    const rawOctave = Math.floor(targetMidi / 12) - 1;
    if (degree != null) {
        const rootLetter = parseNoteSpelling(noteNameForPc(rootPc, useFlats)).letter;
        const spelled = spellByDegree(rootLetter, degree, targetPc);
        if (spelled) return spelled.name + (withOctave ? displayOctaveFor(spelled.letter, spelled.accidental, rawOctave) : '');
    }
    return noteNameForPc(targetPc, useFlats) + (withOctave ? rawOctave : ''); // repli : orthographe générique
}

// Convention dièse/bémol pour LA FONDAMENTALE d'un accord précis (par opposition à la convention
// générale du morceau) : certains degrés chromatiques empruntés (bII, bIII, bV, bVI, bVII) s'écrivent
// TOUJOURS avec un bémol en notation réelle, quel que soit le ton (ex. un bVI en Do majeur s'écrit
// « Lab », jamais « Sol# », puisque c'est littéralement un degré abaissé). En mineur, III/VI/VII sont
// diatoniques (cf. MINOR_ROMAN_MAP) et donc exclus de cette liste : seuls bII et bV y restent
// chromatiques. Pour tout le reste (diatonique, dominantes secondaires...), on garde la convention
// générale du morceau, déjà cohérente avec l'usage (ex. les dominantes secondaires se notent
// généralement avec des dièses/bécarres, pas des bémols).
const FLAT_BORROW_DEGREES_MAJOR = new Set([1, 3, 6, 8, 10]);
const FLAT_BORROW_DEGREES_MINOR = new Set([1, 6]);

// Pour les 5 autres modes (sans réglage main par main comme majeur/mineur ci-dessus), tout degré
// chromatique (hors gamme du mode) est traité en bémol par défaut — convention la plus courante
// pour noter un degré emprunté/abaissé, à défaut d'un usage plus établi pour ces modes.
const MODE_FLAT_BORROW_DEGREES = { maj: FLAT_BORROW_DEGREES_MAJOR, min: FLAT_BORROW_DEGREES_MINOR };
Object.keys(MODE_SCALES).forEach(mode => {
    if (MODE_FLAT_BORROW_DEGREES[mode]) return;
    const scaleSet = new Set(MODE_SCALES[mode]);
    const chromatic = new Set();
    for (let s = 0; s < 12; s++) if (!scaleSet.has(s)) chromatic.add(s);
    MODE_FLAT_BORROW_DEGREES[mode] = chromatic;
});

function useFlatsForChordRoot(chordRootPc, keyRootPc, keyMode, songUseFlats) {
    const diff = ((chordRootPc - keyRootPc) % 12 + 12) % 12;
    const borrow = MODE_FLAT_BORROW_DEGREES[keyMode] || FLAT_BORROW_DEGREES_MAJOR;
    return borrow.has(diff) ? true : songUseFlats;
}

// Plage du clavier affiché : C2 (MIDI 36) -> B5 (MIDI 83), couvre tous les drops
const VIZ_LOW = 36;
const VIZ_HIGH = 83;

// Signatures rythmiques courantes proposées dans l'onglet Morceau (temps par mesure).
// Un « temps » reste ici la noire de l'appli (durées, tempo) : pour les mesures composées
// (6/8, 9/8, 12/8), c'est donc un raccourci pratique plutôt qu'un vrai temps pointé dirigé —
// suffisant pour placer correctement les barres de mesure et la durée « 1 mesure ».
const TIME_SIG_BEATS = { '2/4': 2, '3/4': 3, '4/4': 4, '5/4': 5, '6/8': 6, '7/8': 7, '9/8': 9, '12/8': 12 };

// Nombre de temps affichés par ligne de la grille : un multiple de la mesure proche de 16,
// pour garder des lignes de largeur comparable quelle que soit la signature choisie
function beatsPerRowFor(beatsPerBar) {
    const bars = Math.max(1, Math.round(16 / beatsPerBar));
    return beatsPerBar * bars;
}

// Nombre de mesures affichées d'un coup dans le séquenceur (pour un accord qui en dure plusieurs) :
// une pleine mesure en 4/4, mais 2 en 2/4 (deux fois moins de temps chacune) ou 1 seule dès que la
// mesure est plus longue que 4 temps (5/4, 6/8...) — même largeur visuelle cible qu'une mesure en 4/4,
// pour ne jamais afficher ni trop peu ni trop de croches d'un coup quelle que soit la signature.
function seqPageBars(beatsPerBar) {
    return Math.max(1, Math.round(4 / beatsPerBar));
}

// Réglages d'accord : Entrée depuis l'un d'eux ajoute/modifie directement (moins de clics)
const CHORD_PARAM_IDS = ['root', 'quality', 'duration', 'inversion', 'drop', 'octave', 'bass', 'playStyle', 'instrument'];

// Durées disponibles pour un accord (voir #duration, piloté par setupDurationPicker) : icône en
// barre remplie (proportion de la mesure occupée), même langage visuel pour les 5 — noire/blanche
// juste partiellement remplies (1/4, 1/2 d'une mesure en 4/4), 1/2/4 mesures en barres pleines
// répétées. `label` = libellé compact affiché sous l'icône du bouton fermé, `name` = libellé complet
// dans le menu déroulant (juste le nom : pas besoin d'y répéter "1 temps"/"2 temps", déjà su).
const DURATION_OPTIONS = [
    { beats: '1', label: 'Noire', name: 'Noire',
        svg: '<rect x="1" y="9" width="22" height="7" rx="2.2" fill="none" stroke="currentColor" stroke-width="1.8"/><rect x="1" y="9" width="6" height="7" rx="2.2" fill="currentColor"/>' },
    { beats: '2', label: 'Blanche', name: 'Blanche',
        svg: '<rect x="1" y="9" width="22" height="7" rx="2.2" fill="none" stroke="currentColor" stroke-width="1.8"/><rect x="1" y="9" width="11" height="7" rx="2.2" fill="currentColor"/>' },
    { beats: '4', label: '1 mes.', name: '1 mesure',
        svg: '<rect x="1" y="9" width="22" height="7" rx="2.2" fill="currentColor"/>' },
    { beats: '8', label: '2 mes.', name: '2 mesures',
        svg: '<rect x="1" y="6" width="22" height="5" rx="1.8" fill="currentColor"/><rect x="1" y="13" width="22" height="5" rx="1.8" fill="currentColor"/>' },
    { beats: '16', label: '4 mes.', name: '4 mesures',
        svg: '<rect x="1" y="2.5" width="22" height="4" rx="1.5" fill="currentColor"/><rect x="1" y="8" width="22" height="4" rx="1.5" fill="currentColor"/><rect x="1" y="13.5" width="22" height="4" rx="1.5" fill="currentColor"/><rect x="1" y="19" width="22" height="4" rx="1.5" fill="currentColor"/>' },
];

// Styles de jeu disponibles pour un accord (voir #playStyle, piloté par setupPlayStylePicker) :
// notation musicale réelle — tête(s) de note reliée(s) par une liaison (lié, son continu entre les
// reprises) ou marquées d'un point staccato (détaché) — plutôt qu'une seule icône par cadence : à 8
// reprises/mesure (croche), 8 têtes de note distinctes serait illisible en petit. L'icône ne montre
// donc TOUJOURS que 2 têtes (juste la nature lié/détaché), et c'est le libellé ("4t", "½t"...) qui
// porte la cadence exacte — comme DURATION_OPTIONS, où l'icône porte la forme et le libellé le chiffre.
const TIE_SVG = '<ellipse cx="6" cy="12" rx="3.2" ry="2.3" fill="currentColor"/><ellipse cx="18" cy="12" rx="3.2" ry="2.3" fill="currentColor"/><path d="M6 7 Q12 2 18 7" fill="none" stroke="currentColor" stroke-width="1.6"/>';
const STACCATO_SVG = '<ellipse cx="6" cy="8" rx="3.2" ry="2.3" fill="currentColor"/><ellipse cx="18" cy="8" rx="3.2" ry="2.3" fill="currentColor"/><circle cx="6" cy="14.3" r="1.4" fill="currentColor"/><circle cx="18" cy="14.3" r="1.4" fill="currentColor"/>';
const PLAYSTYLE_OPTIONS = [
    { value: 'held', label: 'Tenu', name: 'Tenu',
        svg: '<ellipse cx="5" cy="8" rx="3.4" ry="2.4" fill="currentColor"/><rect x="9" y="6.2" width="13" height="3.6" rx="1.6" fill="currentColor" opacity="0.55"/>' },
    { value: 'ronde_maintenu', label: '4t', name: '4t', group: 'Lié (son continu)', svg: TIE_SVG },
    { value: 'blanche_maintenu', label: '2t', name: '2t', group: 'Lié (son continu)', svg: TIE_SVG },
    { value: 'noire_maintenu', label: '1t', name: '1t', group: 'Lié (son continu)', svg: TIE_SVG },
    { value: 'croche_maintenu', label: '½t', name: '½t', group: 'Lié (son continu)', svg: TIE_SVG },
    // Pas de suffixe "stac." ici (contrairement au libellé compact de la grille, voir styleMap) :
    // l'icône (points isolés, sans liaison) et l'en-tête de groupe "Détaché" le montrent déjà, sur le
    // bouton fermé comme dans le menu — répéter "staccato" à chaque ligne n'apportait rien de plus.
    { value: 'ronde_staccato', label: '4t', name: '4t', group: 'Détaché (staccato)', svg: STACCATO_SVG },
    { value: 'blanche_staccato', label: '2t', name: '2t', group: 'Détaché (staccato)', svg: STACCATO_SVG },
    { value: 'noire_staccato', label: '1t', name: '1t', group: 'Détaché (staccato)', svg: STACCATO_SVG },
    { value: 'croche_staccato', label: '½t', name: '½t', group: 'Détaché (staccato)', svg: STACCATO_SVG },
    // Crayon (même glyphe que « Renommer » ailleurs dans l'app, juste redimensionné pour tenir dans
    // le même viewBox 0 0 24 16 que les autres icônes de ce menu) : « à toi de le dessiner toi-même ».
    { value: 'arpeggio', label: 'Manuel', name: 'Manuel',
        svg: '<g transform="scale(1,0.667)"><path d="M9 20h9" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/><path d="M13.5 3.5a2.12 2.12 0 0 1 3 3L6 17l-4 1 1-4Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/></g>' },
];

// Récupère la durée en temps d'un accord sauvegardé (compatibilité : anciens formats en "measures").
// Blindé contre une valeur corrompue (ex. chaîne vide, texte, 0 ou négatif) : sans ce garde-fou, un
// seul accord avec un `beats` invalide produisait un total NaN pour toute sa partie ("NaN mes." dans
// l'en-tête) et une case quasi invisible dans la grille (span dégénéré) — repli sur 4 temps (comme
// si la durée n'était pas renseignée du tout) plutôt que de propager la valeur invalide plus loin.
function beatsFromData(data) {
    if (data.beats != null) {
        const n = parseInt(data.beats);
        return (Number.isFinite(n) && n >= 1) ? n : 4;
    }
    if (data.measures != null) return (parseInt(data.measures) || 1) * 4; // ancien format
    return 4;
}

// Nombre de mesures d'une partie (somme des durées de ses accords / temps par mesure) — pour un
// coup d'œil rapide sur sa longueur (grille et export PDF), utile pour une synthèse du morceau.
// Un entier la plupart du temps ; jusqu'à 1 décimale si une partie s'arrête au milieu d'une mesure
// (rare, mais possible selon les durées choisies et la signature rythmique).
function sectionMeasureCount(sec, beatsPerBar) {
    const totalBeats = sec.chords.reduce((sum, c) => sum + beatsFromData(c), 0);
    const count = totalBeats / beatsPerBar;
    return Number.isInteger(count) ? String(count) : count.toFixed(1);
}

// Fond zébré sur UNE MESURE SUR DEUX (pas un temps sur deux : ça se répétait trop vite et perdait
// tout son sens, on ne distinguait plus la mesure elle-même) — la mise en valeur couvre TOUTE la
// largeur de la mesure, pas un simple repère centré sur un temps. S'applique quand même à CHAQUE
// case, y compris un accord plus court qu'une mesure (contrairement à l'ancienne version qui ne
// s'affichait que pour un accord étalé sur plusieurs mesures) : la phase se base sur la position
// ABSOLUE de chaque case dans la grille (pas sur la position du segment lui-même), pour rester
// cohérente d'un accord à l'autre, y compris scindé sur plusieurs lignes.
// Fines hachures obliques (repeating-linear-gradient) par-dessus TOUTE la case, très discrètes : un
// peu de matière/texture plutôt qu'un aplat plat, y compris sur les mesures non mises en valeur.
// `inLoop` : ajoute le lavis doré de la plage à boucler (voir .in-loop-range en CSS) — désormais
// composé ICI plutôt que dans la feuille de style, puisque cette fonction pose maintenant TOUJOURS
// un background-image en ligne sur la case (avant : seulement pour les accords longs), qui
// écraserait sinon complètement celui de la classe CSS (une déclaration en ligne l'emporte toujours).
function buildMeasureZebra(s, beatsPerBar, beatsPerRow, inLoop) {
    const startAbs = s.row * beatsPerRow + s.col;
    const stops = [];
    for (let i = 0; i < s.span; i++) {
        const measureIdx = Math.floor((startAbs + i) / beatsPerBar);
        const on = measureIdx % 2 === 1; // une mesure sur deux
        const color = on ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0)';
        const from = (i / s.span * 100).toFixed(3), to = ((i + 1) / s.span * 100).toFixed(3);
        stops.push(`${color} ${from}%`, `${color} ${to}%`);
    }
    const measureBlocks = `linear-gradient(90deg, ${stops.join(', ')})`;
    const hachures = `repeating-linear-gradient(45deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 5px)`;
    const sheen = `linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 55%)`;
    const loopTint = inLoop ? ', linear-gradient(0deg, rgba(255, 213, 79, 0.1), rgba(255, 213, 79, 0.1))' : '';
    return `${measureBlocks}, ${hachures}, ${sheen}${loopTint}`;
}

// Octave de base d'un accord (défaut 3 = C3, compatibilité avec les sauvegardes sans octave)
function octaveFromData(data) {
    return (data.octave != null) ? parseInt(data.octave) : 3;
}

// Décale la fondamentale ET la basse (si définie) d'un accord de `semitones` demi-tons, en conservant
// tout le reste tel quel (qualité, renversement, drop, octave, durée, style de lecture...). +1200 (100
// tours d'octave) avant le modulo : garantit un résultat toujours positif quel que soit le signe de
// `semitones`, sans changer la classe de hauteur obtenue.
function transposeChordData(data, semitones) {
    const shift = (pc) => NOTES[(NOTES.indexOf(pc) + semitones + 1200) % 12];
    return { ...data, root: shift(data.root), bass: data.bass ? shift(data.bass) : data.bass };
}

// ---------- Sections de la progression (couplet, refrain, etc.) ----------
// Stockage : { sections: [ { title, chords: [...] }, ... ] }
function loadProgressionSections() {
    let raw;
    try { raw = JSON.parse(localStorage.getItem('myProgression')); } catch (e) { raw = null; }
    if (!raw) return [{ title: '', chords: [] }];
    if (Array.isArray(raw)) return [{ title: '', chords: raw }]; // migration : ancien format (tableau plat)
    if (Array.isArray(raw.sections) && raw.sections.length) return raw.sections;
    return [{ title: '', chords: [] }];
}

// Modifications du tampon de travail pas encore reportées dans le morceau enregistré (voir
// saveCurrentSong/Ctrl+S) — volontairement une variable de module (pas this.xxx) : les fonctions
// autonomes ci-dessous (appelées depuis de très nombreux endroits) doivent pouvoir la modifier sans
// dépendre de l'instance HarmoHubApp (pas encore construite au tout premier appel).
let hasUnsavedChanges = false;

// `markDirty=false` : chargement d'un morceau (neuf ou déjà enregistré), pas une modification —
// voir newSong/loadSong, les deux seuls appelants à passer false.
function saveProgressionSections(sections, markDirty = true) {
    localStorage.setItem('myProgression', JSON.stringify({ sections }));
    if (markDirty) hasUnsavedChanges = true;
}

// ---------- Morceaux (plusieurs chansons enregistrées séparément) ----------
// Le « tampon de travail » (myProgression, tonalité, tempo) représente le morceau ouvert, mais n'est
// PLUS recopié automatiquement dans le morceau enregistré à chaque modification (voir
// hasUnsavedChanges ci-dessus) : il faut explicitement Enregistrer (bouton dédié ou Ctrl+S, voir
// saveCurrentSong) pour que les changements soient vraiment sauvegardés.
const SONG_ID_KEY = 'harmoboxCurrentSongId';

function loadSongs() {
    try { return JSON.parse(localStorage.getItem('harmoboxSongs')) || []; } catch (e) { return []; }
}

function saveSongs(songs) {
    localStorage.setItem('harmoboxSongs', JSON.stringify(songs));
}

function getCurrentSongId() {
    return localStorage.getItem(SONG_ID_KEY) || null;
}

function setCurrentSongId(id) {
    if (id) localStorage.setItem(SONG_ID_KEY, id);
    else localStorage.removeItem(SONG_ID_KEY);
}

// Registre des dossiers (fenêtre Paramètres > Fichiers) : une liste de noms, SÉPARÉE des morceaux,
// pour qu'un dossier puisse exister vide (créé à l'avance) plutôt que d'être uniquement déduit des
// morceaux qui s'y trouvent.
function loadFolders() {
    try { return JSON.parse(localStorage.getItem('harmoboxFolders')) || []; } catch (e) { return []; }
}
function saveFolders(folders) {
    localStorage.setItem('harmoboxFolders', JSON.stringify(folders));
}

// Recopie les champs donnés dans le morceau actuellement ouvert (aucun effet si aucun n'est ouvert)
function syncCurrentSong(partial) {
    const id = getCurrentSongId();
    if (!id) return;
    const songs = loadSongs();
    const song = songs.find(s => s.id === id);
    if (!song) return;
    Object.assign(song, partial, { savedAt: Date.now() });
    saveSongs(songs);
}

function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// Récapitulatif des notes d'un accord au-dessus du piano : sans octave (peu utile à ce niveau),
// une note = un « chip » séparé pour un espacement propre entre notes sans écarter les caractères
// à l'intérieur d'une même note (ex. le ♭ doit rester collé à sa lettre, voir .chord-note en CSS).
function chordNotesHtml(chord, useFlats) {
    return chord.getDisplayNotes(useFlats, false).map(n => `<span class="chord-note">${flatTight(n)}</span>`).join('');
}

// Le ♭ a une chasse large dans la police de l'appli et paraît détaché de sa lettre, surtout au
// grand format du titre : on l'entoure d'un span resserré (voir .flat en CSS). Chord.getLabel()
// reste du texte brut (utilisé aussi dans l'export PDF/la grille, où le HTML n'a pas sa place) —
// ce resserrement n'est appliqué qu'à l'affichage du grand titre et de la liste de notes.
function flatTight(text) {
    return text.replace(/♭/g, '<span class="flat">♭</span>');
}

// ---------- Séquenceur pas-à-pas ----------
// Résolution du séquenceur : 4 cases par temps (double-croche). Le nombre de cases suit donc
// toujours la durée de l'accord (1 mesure = 4 temps = 16 double-croches). Visuellement, les cases
// restent groupées par paires de la largeur d'une croche (voir renderSequencer/.seq-cell-a/b) —
// seule la note posée par-dessus peut s'arrêter à la moitié d'un de ces rectangles pour simuler
// une double-croche, sans multiplier le nombre de rectangles visibles.
const SEQ_STEPS_PER_BEAT = 4;

// ---------- Groove (droit / shuffle / ternaire) ----------
// La grille du séquenceur reste TOUJOURS affichée droite (comme dans la plupart des séquenceurs/DAW) :
// le groove ne change rien à son édition, seulement l'instant réel où chaque case tombe à la lecture
// et dans l'export MIDI. Le swing/shuffle « classique » agit au niveau de la CROCHE, pas de la double-
// croche : dans un temps (SEQ_STEPS_PER_BEAT = 4 cases), la 1ère croche (cases 0-1) garde sa durée
// normale et la 2nde (cases 2-3) est repoussée plus tard — 0.5 = coupé en deux également (droit, aucun
// effet), 2/3 = triolet strict (1ère croche deux fois plus longue que la 2nde), valeurs intermédiaires
// = shuffle plus léger. C'est important : Tenu/Ronde/Blanche/Noire/Croche (les préréglages du volet
// Lecture) ne déclenchent jamais une attaque à la double-croche — seule une croche « en retard »
// rendrait le groove audible sur ces préréglages, pas une double-croche « en retard ». Chaque double-
// croche à l'intérieur d'une croche garde sa position relative (moitié du temps qui lui est imparti),
// et chaque temps (case d'index multiple de SEQ_STEPS_PER_BEAT) tombe toujours pile à sa place.
const GROOVE_RATIOS = { straight: 0.5, shuffle: 0.58, ternary: 2 / 3 };
function grooveStepOffset(step, unitDur, ratio) {
    const eighthSteps = SEQ_STEPS_PER_BEAT / 2; // cases par croche (2)
    const beatIndex = Math.floor(step / SEQ_STEPS_PER_BEAT);
    const beatStart = beatIndex * SEQ_STEPS_PER_BEAT * unitDur;
    const local = step - beatIndex * SEQ_STEPS_PER_BEAT;       // position dans le temps (0..3)
    const eighthIndex = Math.floor(local / eighthSteps);        // 0 = 1ère croche, 1 = 2nde croche
    const withinEighth = (local - eighthIndex * eighthSteps) / eighthSteps; // fraction dans sa croche
    const firstEighthDur = ratio * SEQ_STEPS_PER_BEAT * unitDur;
    const eighthStart = eighthIndex === 0 ? 0 : firstEighthDur;
    const eighthDur = eighthIndex === 0 ? firstEighthDur : (SEQ_STEPS_PER_BEAT * unitDur - firstEighthDur);
    return beatStart + eighthStart + withinEighth * eighthDur;
}

// Motif = tableau (une entrée par case) de listes de voix actives (index dans l'accord, grave=0).
// Liaisons (tie) = pour chaque case, la liste des voix qui PROLONGENT la note de la case précédente
// au lieu de déclencher une nouvelle attaque : deux croches actives et adjacentes ne forment une
// seule note tenue que si la seconde est explicitement liée (glissé) — deux clics séparés sur des
// croches voisines restent deux notes distinctes rejouées, même côte à côte.
// Sérialisé en chaîne "0,1,2;;1t;..." (cases séparées par ';', voix séparées par ',', "t" = liée).
function parseSeqPattern(str) {
    if (!str) return { pattern: [], tie: [] };
    if (!str.includes(';')) {
        // Compatibilité avec le tout premier format (une seule voix par case, -1 = silence, jamais liée)
        const pattern = str.split(',').map(x => parseInt(x, 10)).map(v => (!isNaN(v) && v >= 0) ? [v] : []);
        return { pattern, tie: pattern.map(() => []) };
    }
    const pattern = [], tie = [];
    str.split(';').forEach(seg => {
        if (seg === '') { pattern.push([]); tie.push([]); return; }
        const voices = [], tied = [];
        seg.split(',').forEach(tok => {
            if (tok === '') return;
            const isTied = tok.endsWith('t');
            const v = parseInt(isTied ? tok.slice(0, -1) : tok, 10);
            if (isNaN(v)) return;
            voices.push(v);
            if (isTied) tied.push(v);
        });
        pattern.push(voices);
        tie.push(tied);
    });
    return { pattern, tie };
}

function serializeSeqPattern(pattern, tie) {
    return pattern.map((voices, s) => voices.map(v => (tie[s] || []).includes(v) ? `${v}t` : `${v}`).join(',')).join(';');
}

// Ajuste un motif à la durée/voix courantes : tronque s'il est devenu trop long, ou le RÉPÈTE en
// boucle s'il est devenu trop court (ex. un accord tenu qu'on étire de 1 à 4 mesures continue de
// sonner sur toute sa durée, au lieu de laisser les mesures ajoutées totalement silencieuses — c'est
// ce second cas qui produisait un séquenceur apparemment « mort » au-delà de la longueur d'origine).
// Retire aussi les voix devenues hors plage (ex. accord passé de tétrade à triade).
function resizeSeqPattern(pattern, tie, steps, voices) {
    const srcLen = pattern.length;
    const outP = [], outT = [];
    for (let i = 0; i < steps; i++) {
        const srcIdx = srcLen > 0 ? (i % srcLen) : i;
        const v = (pattern[srcIdx] || []).filter(x => x >= 0 && x < voices);
        outP.push(v);
        outT.push((tie[srcIdx] || []).filter(x => v.includes(x)));
    }
    return { pattern: outP, tie: outT };
}

// Durée d'une pulsation, en cases (double-croches), pour chaque préréglage rythmique — indépendante
// de son articulation (maintenu/staccato, voir seqPreset ci-dessous).
const PRESET_PULSE_STEPS = { ronde: 16, blanche: 8, noire: 4, croche: 2 };

// Motifs-types selon le style de lecture, servant de point de départ (modifiable ensuite case par
// case). Deux familles au-delà de « held »/« arpeggio » : un nom de préréglage rythmique combine une
// PULSATION (ronde/blanche/noire/croche) et une ARTICULATION (maintenu/staccato), ex. "noire_staccato"
//   - maintenu  : actif en continu sur toute la durée, mais une nouvelle attaque (non liée) à chaque
//                 pulsation -> son soutenu, sans silence, qui « repique » à intervalles réguliers.
//   - staccato  : une seule croche active (courte, détachée) à chaque pulsation, silence le reste du
//                 temps -> notes brèves façon coup d'archet.
function seqPreset(kind, voices, steps) {
    const allVoices = Array.from({ length: voices }, (_, v) => v);
    if (kind === 'pulsed') kind = 'noire_staccato'; // ancien nom (accords sauvegardés avant ce préréglage)
    if (kind === 'held') {
        // L'accord est tenu sur toute sa durée : toutes les voix actives et liées entre elles,
        // sauf la toute première croche qui déclenche l'attaque initiale
        const pattern = Array.from({ length: steps }, () => allVoices.slice());
        const tie = pattern.map((_, s) => s === 0 ? [] : allVoices.slice());
        return { pattern, tie };
    }
    const [rate, articulation] = kind.split('_');
    const pulse = PRESET_PULSE_STEPS[rate];
    if (pulse) {
        if (articulation === 'staccato') {
            const pattern = Array.from({ length: steps }, (_, s) => (s % pulse === 0) ? allVoices.slice() : []);
            return { pattern, tie: pattern.map(() => []) };
        }
        // maintenu : actif en continu, une nouvelle attaque (non liée) à chaque pulsation seulement
        const pattern = Array.from({ length: steps }, () => allVoices.slice());
        const tie = pattern.map((_, s) => (s % pulse === 0) ? [] : allVoices.slice());
        return { pattern, tie };
    }
    // 'arpeggio', 'clear', ou tout autre cas : pas de pré-remplissage, l'arpège se saisit à la main
    const pattern = Array.from({ length: steps }, () => []);
    return { pattern, tie: pattern.map(() => []) };
}

// Chiffrage romain : degré diatonique de base (I, bII, II...) et qualité naturelle de chaque degré
// (majeur/mineur/diminué) dans un ton majeur ou mineur — sert à nommer la cible d'une dominante
// secondaire (le « V » dans « V7/V ») avec la bonne casse.
// Deux tables séparées par mode : en mineur naturel, III/VI/VII (relative majeure, sus-médiante,
// sous-tonique) sont des degrés DIATONIQUES et ne prennent donc pas de bémol — contrairement à un
// ton majeur, où ces mêmes intervalles sont chromatiques (empruntés à la mineure parallèle). Seuls
// bII (napolitain) et bV restent chromatiques dans les deux modes. #III et #VI (médiante et
// sus-dominante haussées, très rares) complètent la table par cohérence.
const MAJOR_ROMAN_MAP = { 0: 'I', 1: 'bII', 2: 'II', 3: 'bIII', 4: 'III', 5: 'IV', 6: 'bV', 7: 'V', 8: 'bVI', 9: 'VI', 10: 'bVII', 11: 'VII' };
const MINOR_ROMAN_MAP = { 0: 'I', 1: 'bII', 2: 'II', 3: 'III', 4: '#III', 5: 'IV', 6: 'bV', 7: 'V', 8: 'VI', 9: '#VI', 10: 'VII', 11: 'VII' };
const MAJOR_DEGREE_QUALITY = { 0: 'maj', 2: 'min', 4: 'min', 5: 'maj', 7: 'maj', 9: 'min', 11: 'dim' };
const MINOR_DEGREE_QUALITY = { 0: 'min', 2: 'dim', 3: 'maj', 5: 'min', 7: 'min', 8: 'maj', 10: 'maj' };

// Pour les 5 autres modes, table/qualité par degré dérivées automatiquement de MODE_SCALES (tierces
// empilées À L'INTÉRIEUR de la gamme du mode) plutôt que recopiées à la main comme majeur/mineur
// ci-dessus : le degré i de la gamme donne sa tierce en scale[i+2] et sa quinte en scale[i+4]
// (modulo 7, +12 s'il y a un tour de gamme), dont l'écart en demi-tons avec la tonique du degré fixe
// la qualité (majeur/mineur/diminué/augmenté). Les degrés hors gamme (chromatiques) sont nommés par
// bémol du degré diatonique immédiatement au-dessus (même convention que majeur/mineur pour bII/bV).
const ROMAN_NUMERALS_PLAIN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
function buildModeRomanTables(scale) {
    const ext = scale.concat(scale.map(s => s + 12));
    const romanMap = {}, qualityMap = {};
    for (let i = 0; i < 7; i++) {
        const t3 = ext[i + 2] - ext[i], t5 = ext[i + 4] - ext[i];
        let quality = 'min';
        if (t3 === 4 && t5 === 7) quality = 'maj';
        else if (t3 === 3 && t5 === 6) quality = 'dim';
        else if (t3 === 4 && t5 === 8) quality = 'aug';
        else if (t3 === 3 && t5 === 7) quality = 'min';
        romanMap[scale[i]] = ROMAN_NUMERALS_PLAIN[i];
        qualityMap[scale[i]] = quality;
    }
    for (let semi = 0; semi < 12; semi++) {
        if (romanMap[semi] != null) continue;
        let above = semi;
        while (romanMap[above % 12] == null) above++;
        romanMap[semi] = 'b' + romanMap[above % 12];
    }
    return { romanMap, qualityMap };
}
const MODE_ROMAN_TABLES = {
    maj: { romanMap: MAJOR_ROMAN_MAP, qualityMap: MAJOR_DEGREE_QUALITY },
    min: { romanMap: MINOR_ROMAN_MAP, qualityMap: MINOR_DEGREE_QUALITY }
};
['dorian', 'phrygian', 'lydian', 'mixolydian', 'locrian'].forEach(mode => {
    MODE_ROMAN_TABLES[mode] = buildModeRomanTables(MODE_SCALES[mode]);
});

function romanMapFor(keyMode) {
    return (MODE_ROMAN_TABLES[keyMode] || MODE_ROMAN_TABLES.maj).romanMap;
}

function diatonicNumeralFor(diff, keyMode) {
    const tables = MODE_ROMAN_TABLES[keyMode] || MODE_ROMAN_TABLES.maj;
    let numeral = tables.romanMap[diff];
    const quality = tables.qualityMap[diff];
    if (quality === 'min' || quality === 'dim') numeral = numeral.toLowerCase();
    if (quality === 'dim') numeral += '°';
    return numeral;
}

class Chord {
    constructor(root, quality, beats, inversion, drop, octave = 3, bass = null) {
        this.root = root;
        this.quality = quality;
        this.beats = parseInt(beats); // durée en temps
        this.octave = parseInt(octave); // octave de base (3 = C3)
        this.inversion = parseInt(inversion);
        this.drop = drop;
        this.bass = bass || null; // note de basse différente de la fondamentale (ex. "D" sur un Cmaj7/D), ou null
    }

    getIntervals() {
        // .map() -> on ne mute jamais les objets de référence de CHORD_INTERVALS
        return (CHORD_INTERVALS[this.quality] || CHORD_INTERVALS.maj).map(n => ({ ...n }));
    }

    // Un renversement au-delà du nombre de notes n'a pas de sens (ex. 3e renv. sur une triade) :
    // on le limite au dernier renversement possible pour cet accord.
    getEffectiveInversion() {
        return Math.min(this.inversion, this.getIntervals().length - 1);
    }

    // Notes voisées, avec leur fonction (role) et leur degré (pour l'orthographe) conservés à
    // travers renversements et drops. Triée du grave à l'aigu — l'ordre attendu partout où l'affichage
    // seul compte (clavier, PDF, libellés). Pour le séquenceur, qui STOCKE ses motifs par index de
    // voix, voir plutôt getSeqVoices()/_computeVoices() : leur ordre reste stable même quand une basse
    // différente est activée/désactivée, ce que ce tri par hauteur ne garantit pas (voir plus bas).
    getVoiced() {
        return this._computeVoices().sort((a, b) => a.midi - b.midi);
    }

    // Même voicing que getVoiced(), mais SANS le tri final par hauteur : la basse (si présente) reste
    // en dernière position (son ajout n'est qu'un push, voir plus bas), donc l'index d'une voix du
    // CORPS de l'accord (fondamentale/tierce/quinte/7e...) ne dépend jamais de la présence ou non
    // d'une basse différente. Sert exclusivement au séquenceur (voir getSeqVoices), qui STOCKE ses
    // motifs par index de voix : avec getVoiced() (triée), ajouter une basse insère une nouvelle voix
    // la plus grave en TÊTE de tableau et décale l'index de toutes les voix existantes d'un cran —
    // exactement le bug observé (motif/couleurs qui se décalent d'une voix quand la basse est activée).
    _computeVoices() {
        let notes = this.getIntervals();

        const inversion = this.getEffectiveInversion();
        for (let i = 0; i < inversion; i++) {
            const n = notes.shift();
            n.semi += 12;
            notes.push(n);
        }

        // Drop 2 : descend d'une octave la 2e voix en partant du haut. Drop 3 : la 3e voix en
        // partant du haut (sur une triade, c'est alors la voix la plus grave qui descend).
        // Définition purement positionnelle : elle reste valable sur les accords enrichis (9e/11e/
        // 13e) et correspond à un usage réel en jazz (ex. drop 2 sur un accord de 9e, courant en
        // arrangement guitare/piano) — pas besoin de la réserver aux triades/tétrades.
        if (notes.length >= 3) {
            if (this.drop === 'drop2') {
                const [n] = notes.splice(notes.length - 2, 1);
                n.semi -= 12;
                notes.unshift(n);
            } else if (this.drop === 'drop3') {
                const [n] = notes.splice(notes.length - 3, 1);
                n.semi -= 12;
                notes.unshift(n);
            }
        }

        const rootMidi = NOTES.indexOf(this.root) + 12 * (this.octave + 1); // octave 3 -> C3 = 48
        const voiced = notes.map(n => ({ midi: rootMidi + n.semi, role: n.role, degree: n.degree }));

        // Basse différente (accord « sur » une note, ex. Cmaj7/D) : ajoutée SOUS la voix la plus
        // grave actuelle, sans toucher au reste du voicing (renversement/drop restent ceux définis
        // par ailleurs pour les voix du dessus). Sa fonction (rôle/degré, donc sa couleur et son
        // orthographe) suit celle de la note de l'accord qui partage sa classe de hauteur — ex. un Mi
        // en basse sur un Cmaj7 est sa tierce, pas sa fondamentale. Si aucune voix de l'accord ne
        // partage cette classe de hauteur (note réellement étrangère à l'accord, ex. Cmaj7/D), elle
        // est traitée comme une extension (« Autres » dans la légende), orthographiée génériquement.
        if (this.bass) {
            const lowestMidi = Math.min(...voiced.map(v => v.midi));
            let bassMidi = NOTES.indexOf(this.bass) + 12 * (this.octave + 1);
            while (bassMidi >= lowestMidi) bassMidi -= 12;
            const bassSemi = ((NOTES.indexOf(this.bass) - NOTES.indexOf(this.root)) % 12 + 12) % 12;
            const match = notes.find(n => ((n.semi % 12) + 12) % 12 === bassSemi);
            voiced.push({ midi: bassMidi, role: match ? match.role : 'ext', degree: match ? match.degree : null });
        }

        return voiced;
    }

    // Numéros MIDI, triés du plus grave au plus aigu
    getMidiNotes() {
        return this.getVoiced().map(v => v.midi);
    }

    getNotes() {
        return this.getVoiced().map(v => Tone.Frequency(v.midi, "midi").toNote());
    }

    // Notes lisibles pour l'affichage, orthographiées PAR FONCTION (la tierce d'un Ré s'écrit
    // toujours Fa#, jamais Sol♭) ; seule la fondamentale suit la convention dièses/bémols de la
    // tonalité — c'est elle qui sert de point de départ à l'orthographe des autres degrés.
    getDisplayNotes(useFlats = false, withOctave = true) {
        const rootPc = NOTES.indexOf(this.root);
        return this.getVoiced().map(v => spellChordTone(rootPc, useFlats, v.degree, v.midi, withOctave));
    }

    // ---- Variantes « séquenceur » : mêmes notes, ordre STABLE de _computeVoices() (voir plus haut)
    // au lieu de l'ordre trié par hauteur — à utiliser PARTOUT où un index de voix est apparié à un
    // motif du séquenceur (pattern/tie stockés par index), jamais pour un simple affichage isolé.
    getSeqVoices() {
        return this._computeVoices();
    }

    getSeqMidiNotes() {
        return this._computeVoices().map(v => v.midi);
    }

    getSeqNotes() {
        return this._computeVoices().map(v => Tone.Frequency(v.midi, "midi").toNote());
    }

    getSeqDisplayNotes(useFlats = false, withOctave = true) {
        const rootPc = NOTES.indexOf(this.root);
        return this._computeVoices().map(v => spellChordTone(rootPc, useFlats, v.degree, v.midi, withOctave));
    }

    // { 60: "root", 64: "third", ... } pour colorer le clavier (indexé par MIDI, indépendant de l'orthographe)
    getRoleMap() {
        const map = {};
        this.getVoiced().forEach(v => {
            map[v.midi] = v.role;
        });
        return map;
    }

    // Symbole complet, ex : "Cmaj7/Ré · 2e renv. · Drop 2"
    getLabel(useFlats = false) {
        let sym = noteNameForPc(NOTES.indexOf(this.root), useFlats) + (QUALITY_LABEL[this.quality] ?? '');
        if (this.bass) sym += '/' + noteNameForPc(NOTES.indexOf(this.bass), useFlats);
        const parts = [sym];
        const inv = this.getEffectiveInversion();
        if (inv === 1) parts.push('1er renv.');
        if (inv === 2) parts.push('2e renv.');
        if (inv === 3) parts.push('3e renv.');
        if (this.drop === 'drop2') parts.push('Drop 2');
        if (this.drop === 'drop3') parts.push('Drop 3');
        return parts.join(' · ');
    }
}

// ---------- Diagrammes guitare ----------
// Couleurs par fonction, partagées entre le clavier et les diagrammes (piano/guitare) exportés en
// PDF — mêmes rôles que .key.active.role-* dans le CSS (repris ici en dur car ce fichier n'a pas
// accès aux styles calculés pour construire du SVG à l'export).
const ROLE_COLOR = { root: '#00c853', third: '#2f81f7', fifth: '#e53922', seventh: '#ff9800', ext: '#8bd6a8' };

// Dégradés « perlés » (clair -> teinte -> foncé) des points de doigté guitare EN DIRECT (voir
// buildGuitarDiagramSVG) — même principe que les touches actives du piano (.key.active.role-* dans
// style.css), pour un rendu plus joli qu'un simple disque plat. Pas utilisés à l'export PDF
// (forPrint) : l'encre sur papier reste en aplat ROLE_COLOR, plus fiable à l'impression qu'un dégradé.
const ROLE_GRADIENT_STOPS = {
    root:    ['#7dffc2', '#00e676', '#00a855'],
    third:   ['#7fb2ff', '#2f81f7', '#1f5fc0'],
    fifth:   ['#ff8f87', '#ff3b30', '#d42a20'],
    seventh: ['#ffd166', '#ffb300', '#cc8f00'],
    ext:     ['#f0d4ff', '#e0b0ff', '#c48ce6'],
};
let guitarSvgIdSeq = 0; // suffixe unique par diagramme, pour ne jamais dupliquer un id de <radialGradient> quand plusieurs schémas cohabitent dans la page (ex. export PDF, plusieurs doigtés)

// Détecte un barré POUR L'AFFICHAGE (un doigt à plat sur plusieurs cordes à la case la plus basse
// de la forme). Un barré n'est réellement la façon la plus commune de jouer une forme QUE lorsqu'il
// est nécessaire, c'est-à-dire quand il y a plus de cases différentes à tenir que de doigts
// disponibles (4) : en-dessous de ce seuil, un guitariste pose un doigt par corde, même si 2-3 cordes
// se retrouvent par coïncidence à la même case (ex. La ouvert x02220 : Ré/Sol/Si à la case 2, joués
// avec 3 doigts séparés, jamais un mini-barré ; Ré ouvert xx0232 : Sol et Mi aigu à la case 2 avec un
// 3e doigt sur Si à la case 3 entre les deux, jamais un barré non plus). Ce seuil ne concerne QUE cet
// affichage — voir fingersNeeded (dans solveGuitarFingerings) qui, lui, préfère déjà un barré dès que
// c'est possible pour évaluer la difficulté d'un doigté, une hypothèse plus prudente utile au tri mais
// trop permissive pour décider si on DESSINE un barré. Une fois le barré jugé nécessaire, la
// compatibilité géométrique reste la même : seule une corde à VIDE entre les deux cordes extrêmes du
// groupe à la case la plus basse est réellement incompatible avec un barré continu à cet endroit
// (d'autres doigts peuvent presser PAR-DESSUS à une case plus haute sur des cordes intermédiaires,
// cas réel du Fa en forme de Mi). Fonction autonome, jamais utilisée par le solveur de doigtés
// lui-même. Renvoie {fret, loString, hiString} ou null.
function detectBarre(byString) {
    const fretted = [];
    byString.forEach((e, s) => { if (e && e.fret > 0) fretted.push({ s, fret: e.fret }); });
    if (fretted.length <= GUITAR_MAX_FINGERS) return null; // jouable un doigt par case, barré pas nécessaire
    const minFret = Math.min(...fretted.map(f => f.fret));
    const atMin = fretted.filter(f => f.fret === minFret);
    if (atMin.length < 2) return null;
    const strs = atMin.map(f => f.s);
    const loString = Math.min(...strs), hiString = Math.max(...strs);
    for (let s = loString; s <= hiString; s++) {
        const e = byString[s];
        if (e && e.fret === 0) return null; // corde à vide entre les deux : pas de vrai barré ici
    }
    return { fret: minFret, loString, hiString };
}

// Accordage standard, du 6e (Mi grave) au 1er (Mi aigu), en numéros MIDI
const GUITAR_OPEN_MIDI = [40, 45, 50, 55, 59, 64];
const GUITAR_MAX_FRET = 15;   // au-delà, une position n'est plus vraiment utilisée en pratique
const GUITAR_MAX_SPAN = 4;    // écart max (en cases) entre la case la plus basse et la plus haute jouées
const GUITAR_MAX_FINGERS = 4; // 4 doigts disponibles ; une case commune à plusieurs cordes ne compte
                               // que pour un seul doigt (barré)

// Cherche tous les doigtés qui reproduisent EXACTEMENT les notes du voicing donné (mêmes hauteurs,
// pas seulement mêmes classes de note - un accord est fait pour être joué tel quel, pas approximé)
// sur un manche accordé standard. Retourne un tableau (longueur <= limit) trié du doigté le plus
// facile/courant (position basse, peu de doigts, cordes à vide) au plus difficile ; chaque doigté
// est un tableau de 6 cases (index 0 = corde de Mi grave ... 5 = Mi aigu), chacune soit `null`
// (corde étouffée), soit `{ fret, midi, role }`. Tableau vide si aucun doigté n'est jouable.
function solveGuitarFingerings(voiced, limit = 4) {
    if (!voiced.length || voiced.length > 6) return [];

    // Cordes candidates pour chaque note (celles où sa hauteur tombe sur une case valide)
    const candidates = voiced.map(v => {
        const opts = [];
        GUITAR_OPEN_MIDI.forEach((open, string) => {
            const fret = v.midi - open;
            if (fret >= 0 && fret <= GUITAR_MAX_FRET) opts.push({ string, fret });
        });
        return opts;
    });
    if (candidates.some(opts => opts.length === 0)) return []; // note hors de portée de la guitare

    // Notes les plus contraintes (moins d'options) en premier, pour couper court plus vite
    const order = voiced.map((_, i) => i).sort((a, b) => candidates[a].length - candidates[b].length);

    const results = [];
    const usedStrings = new Set();
    const assignment = new Array(voiced.length).fill(null);
    (function backtrack(k) {
        if (k === order.length) { results.push(assignment.slice()); return; }
        const i = order[k];
        for (const { string, fret } of candidates[i]) {
            if (usedStrings.has(string)) continue;
            usedStrings.add(string);
            assignment[i] = { string, fret, midi: voiced[i].midi, role: voiced[i].role };
            backtrack(k + 1);
            usedStrings.delete(string);
            assignment[i] = null;
        }
    })(0);

    // Nombre de doigts requis pour tenir une forme (barré compris). Un barré n'est physiquement
    // possible qu'à la case la PLUS BASSE de la forme (technique réelle : l'index à plat) ET
    // seulement si aucune corde utilisée entre les deux cordes extrêmes du barré n'est prise à une
    // case différente (sinon le doigt à plat changerait aussi sa hauteur) — les cordes étouffées ou
    // à vide dans cet intervalle ne posent pas de problème. Toute autre case partagée par plusieurs
    // cordes (rare) est traitée prudemment comme des doigts séparés plutôt que comme un 2e barré.
    function fingersNeeded(byString) {
        const fretted = [];
        byString.forEach((e, s) => { if (e && e.fret > 0) fretted.push({ s, fret: e.fret }); });
        if (!fretted.length) return 0;
        const minFret = Math.min(...fretted.map(f => f.fret));
        const atMin = fretted.filter(f => f.fret === minFret);
        let barreOk = false;
        if (atMin.length >= 2) {
            const strs = atMin.map(f => f.s);
            const loS = Math.min(...strs), hiS = Math.max(...strs);
            barreOk = true;
            for (let s = loS; s <= hiS; s++) {
                const e = byString[s];
                if (e && e.fret > 0 && e.fret !== minFret) { barreOk = false; break; }
            }
        }
        const barreFingers = barreOk ? 1 : atMin.length;
        const others = fretted.filter(f => f.fret !== minFret).length;
        return barreFingers + others;
    }

    function score(byString) {
        const fretted = byString.filter(e => e && e.fret > 0);
        const openCount = byString.filter(e => e && e.fret === 0).length;
        if (!fretted.length) return { fingers: 0, span: 0, position: 0, openCount, valid: true };
        const frets = fretted.map(e => e.fret);
        const position = Math.min(...frets);
        const span = Math.max(...frets) - position;
        const fingers = fingersNeeded(byString);
        return { fingers, span, position, openCount, valid: fingers <= GUITAR_MAX_FINGERS && span <= GUITAR_MAX_SPAN };
    }

    const seen = new Set();
    const candidates2 = [];
    for (const fingering of results) {
        const byString = new Array(6).fill(null);
        fingering.forEach(f => { byString[f.string] = { fret: f.fret, midi: f.midi, role: f.role }; });
        const key = byString.map(e => e ? e.fret : 'x').join(',');
        if (seen.has(key)) continue;
        seen.add(key);
        candidates2.push(byString);
    }

    return candidates2
        .map(byString => ({ byString, s: score(byString) }))
        .filter(r => r.s.valid)
        .sort((a, b) =>
            a.s.position - b.s.position ||
            a.s.fingers - b.s.fingers ||
            a.s.span - b.s.span ||
            b.s.openCount - a.s.openCount
        )
        .slice(0, limit)
        .map(r => r.byString);
}

// Formes ouvertes standard (celles apprises en tout premier, "école de musique") pour les tons qui
// ont une forme dédiée bien connue — D, G et C n'ont pas de forme mobile simple (contrairement à
// E/A ci-dessous), donc consignées telles quelles. E/A eux-mêmes n'ont pas besoin d'entrée ici : leur
// forme ouverte est simplement leur gabarit de barré (voir BARRE_TEMPLATES) posé à la case 0.
// Case par corde (grave -> aigu), `null` = corde étouffée. Vérifiées note à note contre les
// intervalles de l'accord (voir les commentaires de dérivation dans la conversation de conception).
const OPEN_SHAPES = {
    'D:maj':   [null, null, 0, 2, 3, 2],
    'D:min':   [null, null, 0, 2, 3, 1],
    'D:dom7':  [null, null, 0, 2, 1, 2],
    'G:maj':   [3, 2, 0, 0, 0, 3],
    'G:dom7':  [3, 2, 0, 0, 0, 1],
    'C:maj':   [null, 3, 2, 0, 1, 0],
    'C:dom7':  [null, 3, 2, 3, 1, 0],
};

// Gabarits de barré mobiles (les deux formes enseignées en premier pour jouer N'IMPORTE QUEL ton) :
// forme E (fondamentale à la 6e corde) et forme A (fondamentale à la 5e corde), décalage de case
// (barré) déduit de la tonique demandée. `null` = corde étouffée, nombre = décalage depuis le barré
// (0 = à la hauteur du barré). Dérivées directement des accords ouverts E/Em/E7/Emaj7/Em7 et
// A/Am/A7/Amaj7/Am7 (mêmes décalages, vérifiés note à note), donc fiables pour n'importe quel ton.
const BARRE_TEMPLATES = {
    E: {
        openPc: NOTES.indexOf('E'),
        maj:  [0, 2, 2, 1, 0, 0],
        min:  [0, 2, 2, 0, 0, 0],
        dom7: [0, 2, 0, 1, 0, 0],
        maj7: [0, 2, 1, 1, 0, 0],
        min7: [0, 2, 0, 0, 0, 0],
    },
    A: {
        openPc: NOTES.indexOf('A'),
        maj:  [null, 0, 2, 2, 2, 0],
        min:  [null, 0, 2, 2, 1, 0],
        dom7: [null, 0, 2, 0, 2, 0],
        maj7: [null, 0, 2, 1, 2, 0],
        min7: [null, 0, 2, 0, 1, 0],
    }
};
const BARRE_QUALITIES = ['maj', 'min', 'dom7', 'maj7', 'min7'];

// Formes « communément enseignées » pour un ton/qualité donné (ouverte quand elle existe, puis
// gabarits de barré E et A décalés) — triées de la plus courante (position la plus basse) à la plus
// rare. Tableau vide si la qualité n'a pas de forme standard répandue (accords étendus/rares) :
// c'est alors le solveur exact (solveGuitarFingerings) qui prend le relais, voir guitarFingeringsForChord.
function commonGuitarShapes(root, quality) {
    const rootPc = NOTES.indexOf(root);
    const results = [];

    const openShape = OPEN_SHAPES[`${root}:${quality}`];
    if (openShape) results.push({ shape: openShape, pos: 0 });

    if (BARRE_QUALITIES.includes(quality)) {
        ['E', 'A'].forEach(name => {
            const tpl = BARRE_TEMPLATES[name][quality];
            if (!tpl) return;
            const barreFret = ((rootPc - BARRE_TEMPLATES[name].openPc) % 12 + 12) % 12;
            const shape = tpl.map(f => (f === null ? null : f + barreFret));
            const key = shape.join(',');
            if (results.some(r => r.shape.join(',') === key)) return; // déjà couvert (barreFret 0 == forme ouverte)
            results.push({ shape, pos: barreFret });
        });
    }

    return results.sort((a, b) => a.pos - b.pos).map(r => r.shape);
}

// Convertit une forme (case par corde, `null` = étouffée) en doigté { fret, midi, role } par corde,
// le rôle étant recalculé depuis la hauteur réelle jouée (pas mémorisé à la main -> pas d'erreur
// possible de correspondance avec la couleur affichée).
function shapeToByString(shape, root, quality) {
    const rootPc = NOTES.indexOf(root);
    const intervals = CHORD_INTERVALS[quality] || CHORD_INTERVALS.maj;
    return shape.map((fret, s) => {
        if (fret === null || fret === undefined) return null;
        const midi = GUITAR_OPEN_MIDI[s] + fret;
        const pc = ((midi % 12) + 12) % 12;
        const match = intervals.find(iv => (((rootPc + iv.semi) % 12) + 12) % 12 === pc);
        return { fret, midi, role: match ? match.role : 'ext' };
    });
}

// Point d'entrée unique pour la vue live et l'export PDF : privilégie les formes communément
// enseignées quand elles existent ET que l'accord est en position simple (fondamentale, sans drop
// ni basse différente) — dès que l'utilisateur a personnalisé le voicing (renversement/drop/basse),
// cette personnalisation est délibérée et doit rester fidèle, donc on retombe sur le solveur exact.
function guitarFingeringsForChord(chord) {
    // '#drop' vaut littéralement "none" par défaut (pas "" ni null) quand aucun drop n'est choisi.
    const hasDrop = chord.drop === 'drop2' || chord.drop === 'drop3';
    const isPlainVoicing = chord.getEffectiveInversion() === 0 && !hasDrop && !chord.bass;
    if (isPlainVoicing) {
        const common = commonGuitarShapes(chord.root, chord.quality);
        if (common.length) return common.map(shape => shapeToByString(shape, chord.root, chord.quality));
    }
    return solveGuitarFingerings(chord.getVoiced());
}

// ---------- Banques de sons ----------
// Le piano (échantillonné, Salamander) reste le son par défaut. Les autres sont synthétisés
// (Tone.js) : disponibles instantanément, sans temps de chargement ni bibliothèque à héberger.
// Timbres choisis pour la pratique d'accords — soutenus/harmoniques plutôt que percussifs, pour
// bien laisser entendre chaque voix.
const INSTRUMENT_BANKS = {
    piano: {
        label: 'Piano',
        build: () => new Tone.Sampler({
            urls: {
                "C2": "C2.mp3", "D#2": "Ds2.mp3", "F#2": "Fs2.mp3", "A2": "A2.mp3",
                "C3": "C3.mp3", "D#3": "Ds3.mp3", "F#3": "Fs3.mp3", "A3": "A3.mp3",
                "C4": "C4.mp3", "D#4": "Ds4.mp3", "F#4": "Fs4.mp3", "A4": "A4.mp3",
                "C5": "C5.mp3", "D#5": "Ds5.mp3", "F#5": "Fs5.mp3", "A5": "A5.mp3",
                "C6": "C6.mp3"
            },
            release: 1,
            baseUrl: "https://tonejs.github.io/audio/salamander/"
        })
    },
    epiano: {
        label: 'Piano électrique',
        build: () => new Tone.PolySynth(Tone.FMSynth, {
            harmonicity: 3.01, modulationIndex: 14,
            oscillator: { type: 'sine' },
            envelope: { attack: 0.01, decay: 1.2, sustain: 0.1, release: 1.2 },
            modulation: { type: 'square' },
            modulationEnvelope: { attack: 0.2, decay: 0.01, sustain: 1, release: 0.5 }
        })
    },
    pad: {
        label: 'Nappe',
        build: () => new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: 'triangle' },
            envelope: { attack: 0.6, decay: 0.3, sustain: 0.9, release: 2.5 }
        })
    },
    strings: {
        label: 'Cordes synthé',
        build: () => new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: 'sawtooth' },
            envelope: { attack: 0.25, decay: 0.2, sustain: 0.8, release: 1.5 }
        })
    },
    organ: {
        label: 'Orgue / Lead',
        build: () => new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: 'square' },
            envelope: { attack: 0.02, decay: 0.1, sustain: 1, release: 0.3 }
        })
    },
    bell: {
        label: 'Synthé chaud',
        build: () => new Tone.PolySynth(Tone.AMSynth, {
            harmonicity: 2,
            oscillator: { type: 'sine' },
            envelope: { attack: 0.05, decay: 0.3, sustain: 0.4, release: 1 },
            modulation: { type: 'sine' }
        })
    }
};

// Attend que les instruments à échantillons (Piano) aient fini de charger leurs sons depuis internet
// avant de démarrer une lecture — sans plafond, un réseau absent ou trop lent bloquerait la lecture
// indéfiniment (elle ne démarrerait jamais) plutôt que de simplement laisser filer en silence les
// quelques notes concernées (voir schedulePlayback). Le plafond n'empêche pas le chargement de se
// terminer en arrière-plan ensuite, pour les lectures suivantes.
function waitForAudioReady(timeoutMs = 4000) {
    return Promise.race([
        Tone.loaded().catch(() => {}), // un échec de chargement ne doit jamais empêcher la lecture
        new Promise(resolve => setTimeout(resolve, timeoutMs)),
    ]);
}

const INSTRUMENT_KEY = 'harmoboxInstrument';
const METRONOME_KEY = 'harmoboxMetronomeDuringPlayback';
const METRONOME_VOLUME_KEY = 'harmoboxMetronomeVolume';
const METRONOME_SOUND_KEY = 'harmoboxMetronomeSound';
const GENERAL_VOLUME_KEY = 'harmoboxGeneralVolume';
const AUTOPLAY_SELECT_KEY = 'harmoboxAutoplaySelect';
const METRONOME_COUNTIN_KEY = 'harmoboxMetronomeCountIn';
const METRONOME_SUBDIVISION_KEY = 'harmoboxMetronomeSubdivision';
const SONG_CARD_COLLAPSED_KEY = 'harmoboxSongCardCollapsed';

// Curseurs de volume (0-100, plus intuitif qu'une valeur en décibels) : 0 = silence, 100 = 0 dB
// (plein volume « normal »), avec un plancher à -40 dB pour que même « presque muet » reste audible
// sans à-coup plutôt que de couper brutalement.
function percentToDb(percent) {
    return percent <= 0 ? -Infinity : -40 + (percent / 100) * 40;
}

// Sonorités disponibles pour le métronome. Chacune fabrique son propre instrument Tone.js (des
// timbres assez différents pour ne pas pouvoir se contenter de changer la hauteur d'un seul synthé)
// et sait se déclencher elle-même via `trigger`, en distinguant le temps accentué (1er temps de la
// mesure) du temps normal — par la hauteur pour les sons avec pitch, par le volume pour le bruit blanc.
// `sub` (subdivision, voir metronomeSubdivision) marque un clic de croche entre deux temps : toujours
// le plus discret des trois niveaux, quel que soit `accent` (une subdivision n'est jamais LE temps 1).
const METRONOME_SOUNDS = {
    click: {
        label: 'Clic classique',
        build: () => new Tone.Synth({
            oscillator: { type: 'triangle' },
            envelope: { attack: 0.001, decay: 0.04, sustain: 0, release: 0.02 }
        }),
        trigger: (inst, accent, time, sub) => inst.triggerAttackRelease(sub ? 1250 : (accent ? 1500 : 1000), 0.03, time, sub ? 0.5 : 1)
    },
    // Un vrai coup de baguette/bloc de bois est un bruit bref coloré par une résonance courte — pas
    // une corde qui vibre. PluckSynth (Karplus-Strong) sustient toujours une hauteur nette, façon
    // pincement de corde : quel que soit le réglage, l'oreille l'entend comme une note pincée, jamais
    // comme du bois qui claque. Ici : un bruit très court passé dans un filtre passe-bande étroit,
    // la technique habituelle pour synthétiser claves/wood block (c'est d'ailleurs ainsi que ces sons
    // sont fabriqués sur une boîte à rythmes classique). Composé à la main (bruit -> filtre) plutôt
    // qu'un objet Tone.js tout fait, mais expose la même interface que les autres sonorités
    // (volume/dispose/toDestination) pour rester interchangeable avec elles.
    woodblock: {
        label: 'Baguette',
        build: () => {
            const noise = new Tone.NoiseSynth({
                noise: { type: 'pink' },
                envelope: { attack: 0.001, decay: 0.03, sustain: 0 }
            });
            const filter = new Tone.Filter({ type: 'bandpass', frequency: 900, Q: 1.6 });
            // Un filtre passe-bande aussi étroit ne laisse passer qu'une fraction de l'énergie du
            // bruit d'origine : ce gain fixe compense cette perte pour rester audible au même volume
            // que les autres sonorités. Séparé de `volume` (qui reste le réglage utilisateur, réécrit
            // à chaque changement de son/curseur) pour ne pas s'y faire écraser.
            const boost = new Tone.Gain(4);
            noise.chain(filter, boost);
            return {
                volume: noise.volume,
                toDestination() { boost.toDestination(); return this; },
                triggerAttackRelease(dur, time, vel) { noise.triggerAttackRelease(dur, time, vel); return this; },
                dispose() { noise.dispose(); filter.dispose(); boost.dispose(); return this; },
                _filter: filter
            };
        },
        // La hauteur perçue vient du centre du filtre (pas d'une note) : légèrement plus haut sur le
        // temps accentué, comme deux zones différentes d'un même bloc de bois.
        trigger: (inst, accent, time, sub) => {
            inst._filter.frequency.setValueAtTime(sub ? 950 : (accent ? 1100 : 780), time);
            inst.triggerAttackRelease(0.05, time, sub ? 0.35 : (accent ? 0.95 : 0.65));
        }
    },
    clave: {
        label: 'Clave',
        build: () => new Tone.MetalSynth({
            envelope: { attack: 0.001, decay: 0.03, release: 0.01 },
            harmonicity: 3.1, modulationIndex: 16, resonance: 3500, octaves: 0.5
        }),
        trigger: (inst, accent, time, sub) => inst.triggerAttackRelease(sub ? 'E6' : (accent ? 'C7' : 'G6'), 0.02, time, sub ? 0.5 : 1)
    },
    // FMSynth avec un ratio porteuse/modulante non entier : les partiels obtenus sont inharmoniques
    // mais peu nombreux et bien espacés, ce qui donne un timbre de cloche propre (technique FM
    // classique, ex. patches « Tubular Bells » d'un DX7) — contrairement à MetalSynth, pensé pour un
    // son métallique dense/bruité (cymbale, gong), trop dur pour une cloche « douce ». Un indice de
    // modulation très bas (peu de bandes latérales -> presque un ton pur) et une attaque légèrement
    // adoucie (pas un déclic net) visent une écoute confortable sur plusieurs heures.
    bell: {
        label: 'Cloche douce',
        build: () => new Tone.FMSynth({
            harmonicity: 2.76, modulationIndex: 1.8,
            oscillator: { type: 'sine' },
            modulation: { type: 'sine' },
            envelope: { attack: 0.012, decay: 0.6, sustain: 0, release: 1.4 },
            modulationEnvelope: { attack: 0.012, decay: 0.4, sustain: 0, release: 0.6 }
        }),
        trigger: (inst, accent, time, sub) => inst.triggerAttackRelease(sub ? 'E5' : (accent ? 'C6' : 'A5'), 0.4, time, sub ? 0.22 : (accent ? 0.55 : 0.4))
    },
    tic: {
        label: 'Tic sec',
        build: () => new Tone.NoiseSynth({
            noise: { type: 'white' },
            envelope: { attack: 0.0005, decay: 0.025, sustain: 0 }
        }),
        // Le bruit blanc n'a pas de hauteur : l'accent se distingue par le volume (vélocité) plutôt
        // que par la note.
        trigger: (inst, accent, time, sub) => inst.triggerAttackRelease(0.03, time, sub ? 0.3 : (accent ? 1 : 0.55))
    }
};

// ---------- Encodage MIDI bas niveau (fichier .mid standard, format 1) ----------
// Aucune bibliothèque externe : le format SMF (quantités de longueur variable + méta-événements)
// est assez simple pour s'écrire directement, sans dépendance à héberger.

// Quantité de longueur variable (7 bits utiles par octet, bit de poids fort = "encore un octet suit")
function midiVarLen(value) {
    const bytes = [value & 0x7f];
    value >>= 7;
    while (value > 0) {
        bytes.unshift((value & 0x7f) | 0x80);
        value >>= 7;
    }
    return bytes;
}
function midiU16(n) { return [(n >> 8) & 0xff, n & 0xff]; }
function midiU32(n) { return [(n >> 24) & 0xff, (n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff]; }

function midiTextEvent(type, text) {
    const bytes = Array.from(new TextEncoder().encode(text));
    return [0xff, type, ...midiVarLen(bytes.length), ...bytes];
}
function midiTempoEvent(bpm) {
    const usPerQuarter = Math.round(60000000 / bpm);
    return [0xff, 0x51, 0x03, (usPerQuarter >> 16) & 0xff, (usPerQuarter >> 8) & 0xff, usPerQuarter & 0xff];
}
function midiTimeSigEvent(numerator, denominator) {
    return [0xff, 0x58, 0x04, numerator, Math.round(Math.log2(denominator)), 24, 8];
}

// Une piste = une liste d'événements horodatés en temps ABSOLU (plus simple à construire que des
// deltas au fil de l'eau) ; toBytes() trie et ne convertit en delta-time qu'à la toute fin, en gardant
// l'ordre d'arrivée pour les événements simultanés (ex. Note Off avant Note On sur le même tick).
class MidiTrackBuilder {
    constructor() { this.events = []; }
    push(tick, bytes) { this.events.push({ tick, bytes }); }
    // `minEndTick` : certaines pistes (ex. la piste méta, qui ne porte que le tempo/les repères de
    // parties) n'ont pas d'événement pile à la toute fin du morceau — sans ça, sa fin de piste
    // tomberait avant celle des pistes de notes, ce qui peut fausser la durée totale affichée par le DAW.
    toBytes(minEndTick = 0) {
        const sorted = this.events
            .map((e, i) => ({ ...e, i }))
            .sort((a, b) => (a.tick - b.tick) || (a.i - b.i));
        const out = [];
        let prevTick = 0;
        sorted.forEach(e => {
            out.push(...midiVarLen(e.tick - prevTick), ...e.bytes);
            prevTick = e.tick;
        });
        const endTick = Math.max(minEndTick, prevTick);
        out.push(...midiVarLen(endTick - prevTick), 0xff, 0x2f, 0x00); // End of Track
        return [0x4d, 0x54, 0x72, 0x6b, ...midiU32(out.length), ...out]; // "MTrk" + longueur + contenu
    }
}

// Correspondance approximative avec les instruments General MIDI (GM) : à l'import dans un DAW, chaque
// piste charge d'emblée un son du même esprit que celui de l'appli, avant que l'utilisateur ne le
// remplace par le sien (l'objectif de cet export étant justement de pouvoir changer les sons).
const GM_PROGRAM = { piano: 0, epiano: 4, pad: 88, strings: 50, organ: 80, bell: 89 };
const MIDI_PPQ = 480; // pulsations par noire (doit être divisible par SEQ_STEPS_PER_BEAT)

// Fréquence d'échantillonnage du rendu audio hors-temps réel (export MP3, voir plus bas) : 44,1 kHz,
// standard universel, largement suffisant pour des accords/nappes (pas de contenu ultrasonique à capter).
const MP3_SAMPLE_RATE = 44100;

// Convertit un canal audio Float32 (-1..1, format natif Web Audio) en PCM 16 bits signé, tel
// qu'attendu par l'encodeur MP3 (lame.min.js). Écrêté à [-1, 1] par sécurité (un instrument mal réglé
// pourrait dépasser légèrement l'amplitude nominale).
function floatTo16BitPCM(f32) {
    const out = new Int16Array(f32.length);
    for (let i = 0; i < f32.length; i++) {
        const s = Math.max(-1, Math.min(1, f32[i]));
        out[i] = Math.round(s < 0 ? s * 32768 : s * 32767);
    }
    return out;
}

class HarmoHubApp {
    constructor() {
        // Volume général : agit APRÈS les deux réglages spécifiques ci-dessous (accords, métronome),
        // sur la sortie audio globale de Tone.js — un vrai « volume maître » qui les multiplie tous
        // les deux ensemble sans changer leur équilibre relatif l'un par rapport à l'autre.
        const storedGeneralVol = localStorage.getItem(GENERAL_VOLUME_KEY);
        this.generalVolumePercent = storedGeneralVol !== null ? parseInt(storedGeneralVol) : 100;
        Tone.Destination.volume.value = percentToDb(this.generalVolumePercent);

        // Lecture automatique d'un accord de la grille dès qu'on clique dessus pour le sélectionner
        // (activée par défaut, comme le comportement historique) — désactivable dans Paramètres > Son.
        this.autoplaySelect = localStorage.getItem(AUTOPLAY_SELECT_KEY) !== '0';

        // Clics du décompte avant le début de la lecture de la grille (activés par défaut) —
        // distinct du métronome PENDANT la lecture (this.metronomeDuringPlayback, bouton dédié) :
        // désactivable séparément dans Paramètres > Son (voir playProgression).
        this.metronomeCountIn = localStorage.getItem(METRONOME_COUNTIN_KEY) !== '0';

        // Clic faible additionnel sur le contretemps (croches, "et" de chaque temps) — désactivé par
        // défaut pour ne rien changer au comportement existant (bouton dédié, voir toggle-metronome-
        // subdivision), qu'on garde ou non le métronome pendant la lecture par ailleurs.
        this.metronomeSubdivision = localStorage.getItem(METRONOME_SUBDIVISION_KEY) === '1';

        // Chaque accord choisit sa propre banque de son (voir data.instrument) : plusieurs
        // instruments Tone.js peuvent donc jouer simultanément. Construits à la demande et mis en
        // cache (voir getInstrument) plutôt qu'un seul « activeInstrument » partagé comme avant.
        this.instrumentCache = new Map();

        // Métronome : son au choix (voir METRONOME_SOUNDS et le panneau Son des Paramètres). 80 par
        // défaut = -8 dB, le volume fixe d'avant l'ajout de ce réglage.
        const storedSound = localStorage.getItem(METRONOME_SOUND_KEY);
        this.metronomeSoundKey = (storedSound && METRONOME_SOUNDS[storedSound]) ? storedSound : 'click';
        this.metronome = METRONOME_SOUNDS[this.metronomeSoundKey].build().toDestination();
        const storedMetroVol = localStorage.getItem(METRONOME_VOLUME_KEY);
        this.metronomeVolumePercent = storedMetroVol !== null ? parseInt(storedMetroVol) : 80;
        this.metronome.volume.value = percentToDb(this.metronomeVolumePercent);

        this.activeSection = 0;    // partie (couplet/refrain/...) ciblée par les contrôles courants
        this.loopActiveSection = false; // boucle la partie active au lieu de jouer toute la grille (bouton Grille)
        this.selectedIndex = null; // accord sélectionné dans la grille (au sein de la partie active)
        this.editingIndex = null;  // accord en cours de modification (au sein de la partie active)
        this.drag = null;          // état de glisser-déposer
        this.loopRange = null;     // {section, start, end} : boucle sur une PLAGE d'accords voisins
                                    // (glisser sur la ligne des numéros de mesure, voir
                                    // setupLoopRangeInteractions/playProgression) — comme la barre de
                                    // cycle jaune de GarageBand. Distinct de loopActiveSection (boucle
                                    // TOUTE la partie active, bouton dédié) : quand définie, elle est
                                    // prioritaire sur celui-ci.
        this.clipboard = null;     // presse-papier (copier/coller d'accords)
        this.pianoWindow = null;   // fenêtre clavier courante
        this.guitarKey = null;     // signature (midis triés) du dernier accord affiché à la guitare
        this.guitarFingerings = []; // doigtés jouables pour l'accord courant (voir solveGuitarFingerings)
        this.guitarFingeringIndex = 0; // doigté actuellement affiché parmi guitarFingerings
        this._lastTap = null;      // pour le double-tap (suppression mobile)
        this.tapTimes = [];        // horodatages du tap tempo (voir handleTapTempo)
        this.isPlaying = false;    // une lecture (accord/progression) est-elle en cours ?
        this.seqOpen = false;      // panneau séquenceur ouvert ou non (indépendant du style de lecture)
        this.seqTouched = false;   // l'utilisateur a-t-il personnalisé le motif pour l'accord en cours ?
        this.seqSelections = []; // notes du séquenceur sélectionnées : [{ voice, start, end }, ...]
        this.seqDrag = null;       // état de glisser en cours sur le séquenceur
        this.seqPage = 0;          // mesure(s) affichée(s) pour un accord qui en dure plusieurs (voir seqPageBars)
        this.seqLoopPlay = false;  // « Lecture » du séquenceur reboucle indéfiniment (voir playCurrent)
        this.playheadSection = null; // partie/index de l'accord marqué par la barre de lecture de la
        this.playheadIndex = null;   // grille (voir updateGridPlayhead) : accord sélectionné au repos,
                                      // accord en cours au fil de la lecture — jamais effacée à l'arrêt

        // Garder le métronome pendant la lecture de la grille (pas seulement au décompte) : une
        // préférence d'usage, mémorisée d'une session à l'autre comme le choix d'instrument.
        this.metronomeDuringPlayback = localStorage.getItem(METRONOME_KEY) === '1';

        this.settingsOpen = false; // fenêtre Paramètres (Fichiers, et ce qui s'y ajoutera)
        this.contextMenuTarget = null; // { type: 'song'|'folder', id|name } pendant que le menu contextuel est ouvert

        // Historique annuler/rétablir (Ctrl+Z / Ctrl+Y) : piles de copies profondes de `sections`
        this.undoStack = [];
        this.redoStack = [];
        const UNDO_LIMIT = 50;
        this.undoLimit = UNDO_LIMIT;

        // Historique dédié au séquenceur (motif de l'accord en cours d'édition, pas encore
        // « Ajouté »/« Modifié » dans la grille) : piles de simples chaînes (le format sérialisé de
        // l'input caché #arpPattern EST déjà la représentation complète du motif, pas besoin de plus).
        this.seqUndoStack = [];
        this.seqRedoStack = [];

        // Historique dédié à la fenêtre Paramètres > Fichiers (dossiers créés/renommés/supprimés,
        // morceaux renommés/supprimés/déplacés) : instantané combiné {folders, songs} à chaque action.
        this.filesUndoStack = [];
        this.filesRedoStack = [];

        this.setupEventListeners();
        this.setupDurationPicker();
        this.setupPlayStylePicker();
        this.setupGridInteractions();
        this.setupLoopRangeInteractions();
        this.setupSequencerInteractions();
        this.setupKeyboardShortcuts();
        // Avertissement natif du navigateur si on ferme/recharge la page avec des modifications non
        // enregistrées (voir hasUnsavedChanges/saveCurrentSong) — les navigateurs modernes ignorent le
        // message personnalisé et affichent le leur, mais returnValue déclenche bien la confirmation.
        window.addEventListener('beforeunload', (e) => {
            if (!hasUnsavedChanges) return;
            e.preventDefault();
            e.returnValue = '';
        });
        this.updateKeyLabels();
        this.updateDurationOptions();
        this.loadProgression();
        this.refreshPreview();       // affiche l'accord courant + cadre le clavier dès l'ouverture
        this.renderSequencer();      // prépare le motif (masqué tant que le panneau n'est pas ouvert)
        this.refreshSongList();      // remplit le sélecteur de morceaux enregistrés
        this.updateGlobalUndoRedoButtons();
        this.updateGlobalUndoRedoButtons();
    }

    setupEventListeners() {
        // Bouton « Accord » : tant qu'un accord de la grille est SÉLECTIONNÉ (simple clic) sans être
        // EN COURS DE MODIFICATION (double-clic), on veut entendre CELUI-LÀ — pas l'accord « en train
        // d'être défini » dans le panneau (readChord(), qui peut dater d'une modification précédente
        // sans rapport). Dès qu'on modifie réellement (editingIndex non nul), le panneau redevient
        // prioritaire : on y prévisualise les changements non enregistrés (voir editChord/playCurrent).
        document.getElementById('play').onclick = () => {
            if (this.editingIndex == null && this.selectedIndex != null) {
                this.playSavedChord(this.activeSection, this.selectedIndex);
            } else {
                this.playCurrent();
            }
        };
        document.getElementById('save').onclick = () => this.saveCurrent();
        document.getElementById('save-insert').onclick = () => this.saveCurrent(this.selectedIndex);
        document.getElementById('quick-add-btn').onclick = () => this.addQuickChord();
        document.getElementById('quick-add-input').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); this.addQuickChord(); }
        });
        document.getElementById('play-prog').onclick = () => this.playProgression();
        document.getElementById('stop').onclick = () => this.stopAll();

        document.getElementById('global-undo-btn').onclick = () => this.globalUndo();
        document.getElementById('global-redo-btn').onclick = () => this.globalRedo();

        // La banque de son est un réglage PAR ACCORD (comme le style de lecture), pas un instrument
        // global unique : on ne fait ici que présélectionner le dernier choix pour un nouvel accord,
        // et mémoriser le prochain (voir INSTRUMENT_KEY). La valeur réellement utilisée à la lecture
        // vient toujours de data.instrument (accords sauvegardés) ou du sélecteur (accord en cours).
        const savedInstrument = localStorage.getItem(INSTRUMENT_KEY);
        if (savedInstrument && INSTRUMENT_BANKS[savedInstrument]) {
            document.getElementById('instrument').value = savedInstrument;
        }
        document.getElementById('instrument').onchange = (e) => localStorage.setItem(INSTRUMENT_KEY, e.target.value);

        // Garder le métronome pendant la lecture de la grille (au-delà du seul décompte)
        const metroBtn = document.getElementById('toggle-metronome');
        metroBtn.classList.toggle('active', this.metronomeDuringPlayback);
        metroBtn.onclick = (e) => {
            this.metronomeDuringPlayback = !this.metronomeDuringPlayback;
            e.currentTarget.classList.toggle('active', this.metronomeDuringPlayback);
            localStorage.setItem(METRONOME_KEY, this.metronomeDuringPlayback ? '1' : '0');
        };

        // Clic faible sur le contretemps (croches), en plus du clic normal sur chaque temps
        const metroSubBtn = document.getElementById('toggle-metronome-subdivision');
        metroSubBtn.classList.toggle('active', this.metronomeSubdivision);
        metroSubBtn.onclick = (e) => {
            this.metronomeSubdivision = !this.metronomeSubdivision;
            e.currentTarget.classList.toggle('active', this.metronomeSubdivision);
            localStorage.setItem(METRONOME_SUBDIVISION_KEY, this.metronomeSubdivision ? '1' : '0');
        };

        // Replier/déplier la carte Morceau (tonalité, tempo, groove) une fois le morceau réglé — le
        // titre (#song-select) et Enregistrer restent visibles quoi qu'il arrive (voir CSS #song-card).
        const songCard = document.getElementById('song-card');
        const collapseBtn = document.getElementById('toggle-song-collapse');
        const songCardCollapsed = localStorage.getItem(SONG_CARD_COLLAPSED_KEY) === '1';
        songCard.classList.toggle('collapsed', songCardCollapsed);
        collapseBtn.classList.toggle('collapsed', songCardCollapsed);
        collapseBtn.onclick = () => {
            const collapsed = !songCard.classList.contains('collapsed');
            songCard.classList.toggle('collapsed', collapsed);
            collapseBtn.classList.toggle('collapsed', collapsed);
            localStorage.setItem(SONG_CARD_COLLAPSED_KEY, collapsed ? '1' : '0');
        };

        // Boucle la partie active (bouton Grille) au lieu de jouer toute la grille — pratique
        // pour retravailler un couplet/refrain en boucle sans tout rejouer depuis le début à chaque
        // fois. Se désactive-t-elle en cours de lecture : la boucle en cours va jusqu'à son terme
        // naturel plutôt que de couper brutalement (voir playProgression).
        document.getElementById('toggle-loop-section').onclick = (e) => {
            this.loopActiveSection = !this.loopActiveSection;
            e.currentTarget.classList.toggle('active', this.loopActiveSection);
        };

        // Révèle/masque, d'un même bouton (« … »), tout ce qui est secondaire pour la plupart des
        // accords : qualités moins courantes (diminués, augmentés, enrichis...) ET renversement/drop/
        // octave — regroupés plutôt que répartis sur plusieurs boutons, qui faisaient un peu double
        // emploi. Les qualités passent par un vrai retrait/réinsertion des <option> du DOM (voir
        // toggleSelectOptions) plutôt que par `hidden`, qui n'est pas fiable sur tous les navigateurs
        // (Safari iOS notamment continue d'afficher des <option hidden> dans le sélecteur natif) ; les
        // champs avancés, eux, sont juste un bloc qu'on montre/cache (voir #advanced-fields).
        const qualitySelect = document.getElementById('quality');
        this._complexQualityOptions = Array.from(qualitySelect.querySelectorAll('option.opt-complex'));
        this.toggleSelectOptions(qualitySelect, this._complexQualityOptions, false); // masqué par défaut
        document.getElementById('toggle-complex-quality').onclick = (e) => {
            const btn = e.currentTarget;
            const show = !btn.classList.contains('active');
            this.toggleSelectOptions(qualitySelect, this._complexQualityOptions, show);
            document.getElementById('advanced-fields').hidden = !show;
            // La basse différente n'a de sens qu'en mode accords complexes (voir toggle-bass
            // ci-dessous) : son bouton se masque avec le reste, et son contrôle se range avec lui s'il
            // était ouvert — sans jamais toucher à la valeur choisie (voir toggle-bass, même principe
            // que les autres options avancées).
            const bassBtn = document.getElementById('toggle-bass');
            bassBtn.hidden = !show;
            if (!show) {
                document.getElementById('bass-row').hidden = true;
                bassBtn.classList.remove('active');
            }
            btn.classList.toggle('active', show);
        };

        // Révèle/masque le sélecteur de basse différente (accord « sur » une note, ex. Cmaj7/D) : ne
        // remet jamais la valeur choisie à « Aucune » en masquant — juste le contrôle qui se range,
        // comme les options secondaires ci-dessus. Le bouton lui-même n'est accessible qu'en mode
        // accords complexes (voir toggle-complex-quality et activateMoreOptions).
        document.getElementById('toggle-bass').onclick = (e) => {
            const btn = e.currentTarget;
            const show = !btn.classList.contains('active');
            document.getElementById('bass-row').hidden = !show;
            btn.classList.toggle('active', show);
        };

        // Même principe pour les modes moins courants (dorien, phrygien, lydien, mixolydien, locrien).
        // Majeur/mineur restent nommés ainsi tant que les autres modes sont masqués (plus parlant pour
        // qui ne les connaît pas) ; une fois les 5 autres modes affichés, ils reprennent leur vrai nom
        // (ionien/éolien) pour rester cohérents avec le reste de la liste.
        const modeSelect = document.getElementById('global-mode');
        this._complexModeOptions = Array.from(modeSelect.querySelectorAll('option.opt-mode'));
        this.toggleSelectOptions(modeSelect, this._complexModeOptions, false); // masqué par défaut
        document.getElementById('toggle-complex-mode').onclick = (e) => {
            const btn = e.currentTarget;
            const show = !btn.classList.contains('active');
            this.toggleSelectOptions(modeSelect, this._complexModeOptions, show);
            modeSelect.querySelector('option[value="maj"]').textContent = show ? 'Ionien' : 'Majeur';
            modeSelect.querySelector('option[value="min"]').textContent = show ? 'Éolien' : 'Mineur';
            btn.classList.toggle('active', show);
        };

        document.getElementById('bpm').oninput = (e) => document.getElementById('bpm-val').value = e.target.value;
        document.getElementById('bpm').addEventListener('change', () => { hasUnsavedChanges = true; });

        // Valeur du tempo éditable directement au clavier (clic dessus, taper une valeur, Entrée ou
        // clic ailleurs pour valider) — resynchronisée avec le curseur, dans les mêmes bornes (60-240).
        const bpmSlider = document.getElementById('bpm');
        const bpmValInput = document.getElementById('bpm-val');
        bpmValInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') bpmValInput.blur(); });
        bpmValInput.addEventListener('change', () => {
            let v = parseInt(bpmValInput.value);
            if (isNaN(v)) v = parseInt(bpmSlider.value);
            v = Math.min(240, Math.max(60, v));
            bpmValInput.value = v;
            bpmSlider.value = v;
            hasUnsavedChanges = true;
        });

        document.getElementById('tap-tempo').onclick = () => this.handleTapTempo();

        document.getElementById('global-root').onchange = () => {
            hasUnsavedChanges = true;
            this.updateKeyLabels(); this.loadProgression(); this.refreshPreview();
        };
        document.getElementById('global-mode').onchange = () => {
            hasUnsavedChanges = true;
            this.updateKeyLabels(); this.loadProgression(); this.refreshPreview();
        };
        document.getElementById('time-sig').onchange = () => {
            hasUnsavedChanges = true;
            this.updateDurationOptions();
            this.loadProgression();
            this.refreshPreview();
            this.renderSequencer();
        };
        // Le groove ne change rien à l'affichage (la grille du séquenceur reste visuellement droite,
        // comme dans la plupart des séquenceurs/DAW : seul l'instant réel de chaque case se décale à
        // la lecture/l'export) — pas de re-rendu à déclencher ici, juste la sauvegarde du réglage.
        document.getElementById('groove').onchange = () => {
            hasUnsavedChanges = true;
        };

        // Aperçu en direct : nom de l'accord, clavier et séquenceur mis à jour dès qu'on change un réglage
        ['root', 'quality', 'duration', 'inversion', 'drop', 'octave', 'bass'].forEach(id => {
            document.getElementById(id).addEventListener('change', () => {
                this.seqSelections = []; // les positions des cases peuvent ne plus correspondre au même accord
                this.clearSeqHistory(); // l'historique portait sur une autre forme d'accord
                this.refreshPreview();
                this.renderSequencer();
            });
        });

        // Choisir un style de lecture réinitialise le motif sur le point de départ correspondant
        document.getElementById('playStyle').onchange = () => {
            const chord = this.readChord();
            this.seqTouched = true;
            this.seqSelections = [];
            this.clearSeqHistory(); // nouveau motif de départ : l'ancien historique ne s'applique plus
            const { pattern, tie } = seqPreset(document.getElementById('playStyle').value, chord.getSeqMidiNotes().length, chord.beats * SEQ_STEPS_PER_BEAT);
            this.setLiveSeqPattern(pattern, tie);
            this.renderSequencer();
            this.refreshPreview();
        };

        document.getElementById('toggle-sequencer').onclick = () => this.toggleSequencer();

        document.getElementById('cancel-edit').onclick = () => this.cancelEdit();

        document.getElementById('add-section').onclick = () => this.addSection();
        document.getElementById('transpose-song-down').onclick = () => this.transposeSong(-1);
        document.getElementById('transpose-song-up').onclick = () => this.transposeSong(1);

        document.getElementById('song-select').onchange = (e) => this.onSongSelectChange(e.target.value);
        document.getElementById('song-new').onclick = () => this.newSong();
        document.getElementById('song-save').onclick = () => this.saveCurrentSong();

        // Renommer le morceau ouvert : double-clic (souris) / double-tap (doigt) directement sur son
        // titre, plutôt qu'un bouton dédié séparé. Détection manuelle par minuterie sur `pointerdown`
        // (comme le double-tap d'édition de la grille, voir onGridPointerUp) plutôt que l'événement
        // natif `dblclick` : sur un <select>, le SECOND appui ouvrirait sinon son menu déroulant natif
        // avant qu'un dblclick ne puisse être détecté — preventDefault() dès CE pointerdown l'empêche.
        let lastSongTitleTap = 0;
        document.getElementById('song-select').addEventListener('pointerdown', (e) => {
            const now = Date.now();
            if (now - lastSongTitleTap < 450) {
                e.preventDefault();
                lastSongTitleTap = 0;
                this.startInlineRenameSongMain();
            } else {
                lastSongTitleTap = now;
            }
        });

        // Fenêtre Paramètres : toutes les sections (Son, Fichiers) se rendent ensemble à l'ouverture,
        // en une seule vue qui défile, sans onglet.
        document.getElementById('open-settings').onclick = () => this.openSettings();
        document.getElementById('settings-close').onclick = () => this.closeSettings();
        document.getElementById('settings-overlay').addEventListener('click', (e) => {
            if (e.target.id === 'settings-overlay') this.closeSettings(); // clic sur le fond, pas la fenêtre
        });

        // Menu contextuel (clic droit / appui long) : Renommer/Modifier, Dupliquer (accords
        // uniquement), Supprimer — réutilisé pour les morceaux, les dossiers ET les accords de la
        // grille (voir attachContextMenuTrigger, appelé depuis renderFilesPanel et loadProgression).
        document.querySelector('[data-ctx-action="rename"]').onclick = () => {
            const t = this.contextMenuTarget;
            this.closeContextMenu();
            if (!t) return;
            if (t.type === 'song') this.startInlineRenameSong(t.id);
            else if (t.type === 'folder') this.startInlineRenameFolder(t.name);
            else if (t.type === 'chord') this.editChord(t.section, t.index);
        };
        document.querySelector('[data-ctx-action="duplicate"]').onclick = () => {
            const t = this.contextMenuTarget;
            this.closeContextMenu();
            if (t && t.type === 'chord') this.duplicateChord(t.section, t.index);
        };
        document.querySelector('[data-ctx-action="octave-up"]').onclick = () => {
            const t = this.contextMenuTarget;
            this.closeContextMenu();
            if (t && t.type === 'chord') this.changeChordOctave(t.section, t.index, 1);
        };
        document.querySelector('[data-ctx-action="octave-down"]').onclick = () => {
            const t = this.contextMenuTarget;
            this.closeContextMenu();
            if (t && t.type === 'chord') this.changeChordOctave(t.section, t.index, -1);
        };
        document.querySelector('[data-ctx-action="sequencer"]').onclick = () => {
            const t = this.contextMenuTarget;
            this.closeContextMenu();
            if (t && t.type === 'chord') this.openSequencerFor(t.section, t.index);
        };
        document.querySelector('[data-ctx-action="delete"]').onclick = () => {
            const t = this.contextMenuTarget;
            this.closeContextMenu();
            if (!t) return;
            if (t.type === 'song') this.deleteSongById(t.id);
            else if (t.type === 'folder') this.deleteFolder(t.name);
            // Contrairement à Suppr au clavier (rapide, protégé par Ctrl+Z) : ce chemin est le SEUL
            // moyen de supprimer un accord sur tactile (plus de petit bouton dédié), une confirmation
            // évite qu'un appui long malheureux n'efface un accord sans qu'on s'en rende compte.
            else if (t.type === 'chord') { if (confirm('Supprimer cet accord ?')) this.removeChord(t.section, t.index); }
        };
        document.addEventListener('pointerdown', (e) => {
            const menu = document.getElementById('context-menu');
            if (!menu.hidden && !menu.contains(e.target)) this.closeContextMenu();
        });
        // Clic en dehors du popup « où insérer ? » (voir openSectionPicker) : referme sans rien
        // ajouter, comme le menu contextuel ci-dessus.
        document.addEventListener('pointerdown', (e) => {
            const picker = document.getElementById('section-picker-menu');
            if (!picker.hidden && !picker.contains(e.target)) this.closeSectionPicker();
        });

        // Désélectionne l'accord de la grille dès qu'on clique en dehors de la grille et du menu
        // contextuel — évite l'ambiguïté entre l'accord SÉLECTIONNÉ (voir bouton « Accord » ci-
        // dessus) et l'accord affiché dans le panneau, une fois qu'on est passé à autre chose.
        // En phase 'click' (pas 'pointerdown') : un bouton comme « Grille » lit encore selectedIndex
        // (démarrage depuis l'accord en surbrillance) dans son propre clic AVANT que celui-ci ne
        // remonte jusqu'ici et déselectionne.
        // Annule aussi une édition en cours (referme facilement le contour orange sans chercher le
        // bouton Annuler) — mais SEULEMENT en dehors du panneau Accord/séquenceur (.col-left, qui
        // contient aussi bien les réglages BPM/instrument/Grille que le séquenceur) : contrairement à
        // la sélection, y cliquer fait partie de l'édition elle-même, pas un clic « ailleurs ».
        document.addEventListener('click', (e) => {
            const inGrid = !!e.target.closest('.chord-grid');
            const inMenu = !!e.target.closest('#context-menu');
            const inEditor = !!e.target.closest('.col-left');
            let changed = false;
            if (!inGrid && !inMenu && this.selectedIndex != null) { this.selectedIndex = null; changed = true; }
            if (!inGrid && !inMenu && !inEditor && this.editingIndex != null) { this.exitEditMode(); changed = true; }
            if (changed) this.loadProgression();
        });

        document.getElementById('export-pdf').onclick = () => this.exportPdf();
        document.getElementById('export-midi').onclick = () => this.exportMidi();
        document.getElementById('export-audio').onclick = () => this.exportAudio();

        // Bascule piano/guitare : indépendantes, les deux peuvent s'afficher côte à côte ou aucune.
        document.getElementById('toggle-viz-piano').onclick = () => {
            localStorage.setItem('harmoboxShowPiano', this.showPianoViz() ? '0' : '1');
            this.applyVizVisibility();
        };
        document.getElementById('toggle-viz-guitar').onclick = () => {
            const wasOn = this.showGuitarViz();
            localStorage.setItem('harmoboxShowGuitar', wasOn ? '0' : '1');
            this.applyVizVisibility();
            if (!wasOn) this.refreshPreview(); // vient d'être activée : calcule le diagramme de l'accord courant
        };
        document.getElementById('guitar-prev').onclick = () => this.cycleGuitarFingering(-1);
        document.getElementById('guitar-next').onclick = () => this.cycleGuitarFingering(1);
        this.applyVizVisibility();
    }

    // Bascule la visibilité de certaines <option> d'un <select> en les retirant/réinsérant réellement
    // du DOM (plutôt que de jouer sur l'attribut `hidden`, qui n'est pas fiable dans tous les
    // navigateurs pour des <option> — certaines versions de Safari iOS continuent de les afficher
    // dans le sélecteur natif). Ne retire jamais l'option actuellement sélectionnée, pour ne pas
    // changer silencieusement la valeur en cours. `options` doit lister les <option> dans leur ordre
    // d'origine (elles sont réinsérées dans cet ordre, à la fin du select).
    toggleSelectOptions(select, options, show) {
        options.forEach(o => {
            if (show) {
                if (!o.isConnected) select.appendChild(o);
            } else if (o.value !== select.value && o.isConnected) {
                select.removeChild(o);
            }
        });
    }

    // Active le mode « plus d'options » du bouton « … » : qualités moins courantes ET renversement/
    // drop/octave ensemble (voir le onclick de toggle-complex-quality) — un seul bouton, un seul état
    // « actif », pour les deux à la fois. Ne fait rien s'il est déjà actif.
    activateMoreOptions() {
        const btn = document.getElementById('toggle-complex-quality');
        if (btn.classList.contains('active')) return;
        this.toggleSelectOptions(document.getElementById('quality'), this._complexQualityOptions, true);
        document.getElementById('advanced-fields').hidden = false;
        document.getElementById('toggle-bass').hidden = false; // la basse différente n'a de sens qu'ici
        btn.classList.add('active');
    }

    // Révèle le menu Qualité complet AVANT d'y affecter une valeur venue de données sauvegardées
    // (accord enregistré avec une qualité moins courante) — sinon, l'option correspondante n'existe
    // pas encore dans le DOM (voir toggleSelectOptions) et l'affectation échouerait silencieusement.
    // Même principe que pour la basse différente (voir editChord).
    revealComplexQualityIfNeeded(quality) {
        if (!this._complexQualityOptions.some(o => o.value === quality)) return;
        this.activateMoreOptions();
    }

    revealComplexModeIfNeeded(mode) {
        const btn = document.getElementById('toggle-complex-mode');
        if (btn.classList.contains('active') || !this._complexModeOptions.some(o => o.value === mode)) return;
        const modeSelect = document.getElementById('global-mode');
        this.toggleSelectOptions(modeSelect, this._complexModeOptions, true);
        modeSelect.querySelector('option[value="maj"]').textContent = 'Ionien';
        modeSelect.querySelector('option[value="min"]').textContent = 'Éolien';
        btn.classList.add('active');
    }

    // Révèle renversement/drop/octave en modifiant un accord qui s'en sert déjà (l'un des trois
    // s'écarte de son réglage par défaut), pour ne pas les laisser masqués sous les yeux de qui édite
    // sans le savoir — même principe que la basse (voir editChord) et les qualités complexes.
    revealAdvancedIfNeeded(d) {
        const needsAdvanced = (parseInt(d.inversion) || 0) !== 0
            || (d.drop && d.drop !== 'none')
            || octaveFromData(d) !== 3;
        if (!needsAdvanced) return;
        this.activateMoreOptions();
    }

    // Lit les réglages de l'interface et renvoie un Chord
    readChord() {
        return new Chord(
            document.getElementById('root').value,
            document.getElementById('quality').value,
            document.getElementById('duration').value,
            document.getElementById('inversion').value,
            document.getElementById('drop').value,
            document.getElementById('octave').value,
            document.getElementById('bass').value || null
        );
    }

    // Tonalité du morceau -> faut-il orthographier les notes en bémols plutôt qu'en dièses ?
    useFlats() {
        const rootPc = NOTES.indexOf(document.getElementById('global-root').value);
        const mode = document.getElementById('global-mode').value;
        return useFlatsForKey(rootPc, mode);
    }

    // Convention dièse/bémol pour la fondamentale d'UN accord précis : part de la convention
    // générale du morceau, forcée en bémol pour les degrés chromatiques empruntés (voir
    // useFlatsForChordRoot). C'est ce choix qui doit être passé à Chord.getLabel/getDisplayNotes,
    // jamais this.useFlats() directement, sous peine de mal orthographier les accords empruntés.
    useFlatsForRoot(root) {
        const gRootPc = NOTES.indexOf(document.getElementById('global-root').value);
        const gMode = document.getElementById('global-mode').value;
        return useFlatsForChordRoot(NOTES.indexOf(root), gRootPc, gMode, this.useFlats());
    }

    // Relabelle les listes déroulantes de notes (tonalité + accord) selon la convention dièses/bémols
    updateKeyLabels() {
        const mode = document.getElementById('global-mode').value;
        document.querySelectorAll('#global-root option').forEach(opt => {
            const pc = NOTES.indexOf(opt.value);
            opt.textContent = noteNameForPc(pc, useFlatsForKey(pc, mode));
        });
        const songFlats = this.useFlats();
        document.querySelectorAll('#root option').forEach(opt => {
            const pc = NOTES.indexOf(opt.value);
            opt.textContent = noteNameForPc(pc, songFlats);
        });
        document.querySelectorAll('#bass option[value]:not([value=""])').forEach(opt => {
            const pc = NOTES.indexOf(opt.value);
            opt.textContent = noteNameForPc(pc, songFlats);
        });
    }

    // Temps par mesure de la signature rythmique du morceau (4/4 par défaut)
    beatsPerBar() {
        return TIME_SIG_BEATS[document.getElementById('time-sig').value] || 4;
    }

    // Taux de groove du morceau (droit par défaut) : voir GROOVE_RATIOS/grooveStepOffset.
    grooveRatio() {
        return GROOVE_RATIOS[document.getElementById('groove').value] ?? GROOVE_RATIOS.straight;
    }

    // Aligne les valeurs (en temps) de « 1/2/4 mesures » sur la signature rythmique courante,
    // en conservant Noire/Blanche à 1 et 2 temps quelle que soit la mesure
    updateDurationOptions() {
        const bpb = this.beatsPerBar();
        const values = [1, 2, bpb, bpb * 2, bpb * 4];
        document.querySelectorAll('#duration option').forEach((opt, i) => {
            if (values[i] != null) opt.value = values[i];
        });
    }

    // Met à jour le grand titre + la liste de notes, sans jouer de son
    refreshPreview() {
        const chord = this.readChord();
        const midis = chord.getMidiNotes();
        const useFlats = this.useFlatsForRoot(chord.root);
        const disp = document.getElementById('current-chord-display');
        disp.innerHTML = `<span class="chord-title">${flatTight(chord.getLabel(useFlats))}</span><span class="chord-notes">${chordNotesHtml(chord, useFlats)}</span>`;
        this.ensurePianoWindow(midis);
        this.updateViz(midis, chord.getRoleMap());
        this.ensureGuitarDiagram(chord);
    }

    // Calcule une fenêtre clavier (multiple de 12, alignée sur des Do) englobant l'accord,
    // d'au moins 2 octaves, étendue à 3 seulement si le voicing est très étalé
    computePianoWindow(midis) {
        if (!midis || midis.length === 0) return { low: 48, high: 72 }; // C3..C5 par défaut
        const min = Math.min(...midis), max = Math.max(...midis);
        const floorC = m => m - (((m % 12) + 12) % 12);
        const ceilC = m => { const r = ((m % 12) + 12) % 12; return r === 0 ? m : m + (12 - r); };
        let low = floorC(min), high = ceilC(max);
        while (high - low < 24) {
            if ((min - low) <= (high - max)) low -= 12; else high += 12;
        }
        return { low, high };
    }

    // Re-render le clavier si la fenêtre a changé (évite les re-render inutiles pendant un arpège)
    ensurePianoWindow(midis) {
        const w = this.computePianoWindow(midis);
        if (this.pianoWindow && this.pianoWindow.low === w.low && this.pianoWindow.high === w.high) return;
        this.pianoWindow = w;
        this.renderPiano(w.low, w.high);
    }

    renderPiano(low = 48, high = 72) {
        const viz = document.getElementById('piano-viz');
        viz.innerHTML = '';

        // 1) Touches blanches en flux (flex, largeur égale)
        const whiteMidis = [];
        for (let m = low; m <= high; m++) {
            if (![1, 3, 6, 8, 10].includes(((m % 12) + 12) % 12)) whiteMidis.push(m);
        }
        whiteMidis.forEach(m => {
            const k = document.createElement('div');
            k.className = 'key white';
            k.dataset.midi = m;
            viz.appendChild(k);
        });

        const totalWhite = whiteMidis.length;
        // Largeur cible d'une blanche (≈17px, 50% de la taille d'origine pour mettre en valeur la
        // grille d'accords) -> le clavier ne s'étire pas sur les grands écrans, et reste réaliste ;
        // sur mobile il rétrécit (width: 100%).
        viz.style.maxWidth = `${totalWhite * 17}px`;

        // 2) Touches noires : largeur ≈62% d'une blanche, centrées sur la frontière (tout en %)
        const unit = 100 / totalWhite;      // largeur d'une blanche en % du clavier
        const blackW = unit * 0.62;
        let whiteSeen = 0;
        for (let m = low; m <= high; m++) {
            const isBlack = [1, 3, 6, 8, 10].includes(((m % 12) + 12) % 12);
            if (!isBlack) { whiteSeen++; continue; }
            const k = document.createElement('div');
            k.className = 'key black';
            k.dataset.midi = m;
            k.style.width = `${blackW}%`;
            k.style.left = `calc(${whiteSeen * unit}% - ${blackW / 2}%)`;
            viz.appendChild(k);
        }
    }

    // `midis` : numéros MIDI à surligner ; `roleMap` : { midi: role } (voir Chord.getRoleMap)
    updateViz(midis, roleMap = {}) {
        const ROLE_CLASSES = ['active', 'role-root', 'role-third', 'role-fifth', 'role-seventh', 'role-ext'];
        document.querySelectorAll('.key').forEach(k => k.classList.remove(...ROLE_CLASSES));
        midis.forEach(m => {
            const el = document.querySelector(`.key[data-midi="${m}"]`);
            if (el) {
                el.classList.add('active', 'role-' + (roleMap[m] || 'ext'));
            }
        });
    }

    clearViz() {
        document.querySelectorAll('.key').forEach(k =>
            k.classList.remove('active', 'role-root', 'role-third', 'role-fifth', 'role-seventh', 'role-ext'));
    }

    // Recalcule les doigtés guitare seulement si l'accord a changé — évite de tout reconstruire à
    // chaque croche pendant un arpège, comme ensurePianoWindow pour le clavier. Prend le CHORD ENTIER
    // (pas juste ses notes) : à la guitare, les doigts restent posés sur tout l'accord du début à la
    // fin (contrairement au piano), et le ton/qualité sont nécessaires pour choisir une forme
    // communément enseignée plutôt que le voicing brut (voir guitarFingeringsForChord).
    ensureGuitarDiagram(chord) {
        if (!this.showGuitarViz()) return;
        const key = `${chord.root}:${chord.quality}:${chord.getMidiNotes().join(',')}`;
        if (this.guitarKey === key) return;
        this.guitarKey = key;
        this.guitarFingerings = guitarFingeringsForChord(chord);
        this.guitarFingeringIndex = 0;
        this.renderGuitarDiagram();
    }

    renderGuitarDiagram() {
        const viz = document.getElementById('guitar-viz');
        if (!viz) return;
        const fingerings = this.guitarFingerings;
        const nav = document.getElementById('guitar-nav');
        if (!fingerings.length) {
            viz.innerHTML = `<div class="guitar-unplayable">Non jouable à la guitare</div>`;
            if (nav) nav.style.display = 'none';
            return;
        }
        const idx = Math.min(this.guitarFingeringIndex, fingerings.length - 1);
        this.guitarFingeringIndex = idx;
        viz.innerHTML = this.buildGuitarDiagramSVG(fingerings[idx]);
        if (nav) {
            nav.style.display = fingerings.length > 1 ? '' : 'none';
            const label = document.getElementById('guitar-nav-label');
            if (label) label.textContent = `${idx + 1}/${fingerings.length}`;
        }
    }

    cycleGuitarFingering(delta) {
        if (!this.guitarFingerings.length) return;
        const n = this.guitarFingerings.length;
        this.guitarFingeringIndex = (this.guitarFingeringIndex + delta + n) % n;
        this.renderGuitarDiagram();
    }

    clearGuitarViz() {
        this.guitarKey = null;
        this.guitarFingerings = [];
        this.guitarFingeringIndex = 0;
        const viz = document.getElementById('guitar-viz');
        if (viz) viz.innerHTML = '';
        const nav = document.getElementById('guitar-nav');
        if (nav) nav.style.display = 'none';
    }

    // Préférences d'affichage piano/guitare (persistées) : indépendantes l'une de l'autre, les deux
    // peuvent être affichées côte à côte ou aucune des deux.
    showPianoViz() { return localStorage.getItem('harmoboxShowPiano') !== '0'; }
    showGuitarViz() { return localStorage.getItem('harmoboxShowGuitar') === '1'; }

    applyVizVisibility() {
        const showPiano = this.showPianoViz(), showGuitar = this.showGuitarViz();
        const pianoEl = document.getElementById('piano-viz');
        const guitarWrap = document.getElementById('guitar-viz-wrap');
        const legend = document.querySelector('.piano-legend');
        const tPiano = document.getElementById('toggle-viz-piano');
        const tGuitar = document.getElementById('toggle-viz-guitar');
        if (pianoEl) pianoEl.style.display = showPiano ? '' : 'none';
        if (guitarWrap) guitarWrap.style.display = showGuitar ? 'flex' : 'none';
        if (legend) legend.style.display = (showPiano || showGuitar) ? '' : 'none';
        if (tPiano) { tPiano.classList.toggle('active', showPiano); tPiano.setAttribute('aria-pressed', showPiano); }
        if (tGuitar) { tGuitar.classList.toggle('active', showGuitar); tGuitar.setAttribute('aria-pressed', showGuitar); }
    }

    stopAll() {
        Tone.Transport.stop();
        Tone.Transport.cancel();
        this.instrumentCache.forEach(inst => inst.releaseAll());
        this.clearViz();
        this.clearGuitarViz();
        this.highlightPlaying(null, null);
        this.isPlaying = false;
        this.updateSeqPlayhead(null);
    }

    // Instrument Tone.js pour cette banque, construit puis mis en cache au premier accord qui s'en
    // sert (plusieurs peuvent donc jouer en même temps, chaque accord ayant potentiellement la sienne).
    getInstrument(key) {
        if (!INSTRUMENT_BANKS[key]) key = 'piano';
        let inst = this.instrumentCache.get(key);
        if (!inst) {
            inst = INSTRUMENT_BANKS[key].build().toDestination();
            this.instrumentCache.set(key, inst);
        }
        return inst;
    }

    // Joue un motif de séquenceur (résolution croche) : regroupe les cases actives contiguës d'une
    // même voix en une seule note tenue plutôt que de rejouer une attaque à chaque croche — c'est ce
    // qui permet à un motif « tout allumé » de sonner comme un accord soutenu (Maintenu), tout en
    // restant un motif éditable case par case comme un vrai séquenceur pas-à-pas.
    schedulePlayback(notes, midis, seqPattern, seqTie, secPerBeat, timeOffset, roleMap = {}, instrumentKey = 'piano', chord = null, trackPlayhead = false, gridPos = null) {
        const instrument = this.getInstrument(instrumentKey);
        const stepDur = secPerBeat / SEQ_STEPS_PER_BEAT;
        const steps = seqPattern.length;
        // Instant réel d'une case, groove pris en compte (voir GROOVE_RATIOS/grooveStepOffset) : la
        // grille elle-même ne change pas, seul cet instant se décale.
        const ratio = this.grooveRatio();
        const stepTime = (s) => timeOffset + grooveStepOffset(s, stepDur, ratio);

        // Surbrillance clavier : à chaque croche, affiche les voix actives à cet instant précis.
        // trackPlayhead (uniquement pour playCurrent, jamais pour la lecture de toute la grille où
        // l'accord affiché dans le panneau n'est pas forcément celui qui sonne) anime en plus le
        // curseur de lecture du séquenceur, s'il est ouvert sur cet accord.
        for (let s = 0; s < steps; s++) {
            const activeMidis = seqPattern[s].map(v => midis[v]);
            Tone.Transport.schedule((t) => {
                Tone.Draw.schedule(() => {
                    // Ce bloc tourne à CHAQUE croche de CHAQUE accord pendant la lecture de toute la
                    // grille : une exception ici importe silencieusement TOUT le traitement des
                    // évènements suivants du transport (même constat que pour triggerAttackRelease,
                    // voir plus bas) — la grille se figeait alors sur le premier accord concerné,
                    // quel que soit l'état du réseau ou de l'instrument. Un filet, comme pour le son.
                    try {
                        this.ensurePianoWindow(midis); this.updateViz(activeMidis, roleMap);
                        if (chord) this.ensureGuitarDiagram(chord);
                        if (trackPlayhead) this.updateSeqPlayhead(s);
                        if (gridPos && chord) this.setGridPlayheadProgress(gridPos.section, gridPos.index, s / SEQ_STEPS_PER_BEAT, chord.beats);
                    } catch (e) {
                        console.warn('Mise à jour visuelle ignorée (croche', s, ') :', e.message);
                    }
                }, t);
            }, stepTime(s));
        }

        // Son : une note tenue par plage de croches liées (une croche active mais NON liée
        // déclenche toujours une nouvelle attaque, même juste après une autre note)
        for (let voice = 0; voice < notes.length; voice++) {
            let s = 0;
            while (s < steps) {
                if (!seqPattern[s].includes(voice)) { s++; continue; }
                const runStart = s;
                s++;
                while (s < steps && seqPattern[s].includes(voice) && seqTie[s].includes(voice)) s++;
                const runLen = s - runStart;
                const held = (runLen === steps);          // actif du début à la fin -> accord tenu
                const onBeat = (runStart % SEQ_STEPS_PER_BEAT === 0);
                const vel = held ? 1 : (onBeat ? 0.78 + Math.random() * 0.1 : 0.6 + Math.random() * 0.12);
                const humanize = held ? 0 : Math.random() * 0.02;
                const t0 = stepTime(runStart);
                const runDur = stepTime(runStart + runLen) - t0; // durée réelle de la plage, groove compris
                const dur = held ? (runDur - 0.1) : Math.max(0.05, runDur - Math.min(0.06, stepDur * 0.2));
                Tone.Transport.schedule((t) => {
                    // Un instrument à échantillons (Piano) peut ne pas encore avoir fini de charger ses
                    // sons (réseau lent, ou lecture démarrée dans la même seconde que le choix de
                    // l'instrument) : sans ce filet, l'exception levée ici interrompait le traitement
                    // des évènements suivants du transport — la grille entière (surbrillance, barre de
                    // lecture, chiffrage affiché) restait figée après le tout premier accord concerné,
                    // même si celui-ci ne jouait qu'un silence à la place de la note manquante.
                    try {
                        instrument.triggerAttackRelease(notes[voice], dur, t + humanize, vel);
                    } catch (e) {
                        console.warn('Note ignorée (instrument pas encore prêt) :', e.message);
                    }
                }, t0);
            }
        }
    }

    async playCurrent() {
        await Tone.start();
        this.stopAll();

        const chord = this.readChord();
        const notes = chord.getSeqNotes();
        this.refreshPreview();

        const { pattern: seqPattern, tie: seqTie } = this.getLiveSeqPattern(chord);
        const bpm = parseInt(document.getElementById('bpm').value);
        const secPerBeat = 60 / bpm;
        const instrumentKey = document.getElementById('instrument').value;

        this.schedulePlayback(notes, chord.getSeqMidiNotes(), seqPattern, seqTie, secPerBeat, 0.1, chord.getRoleMap(), instrumentKey, chord, true);
        this.isPlaying = true;

        // Attend que l'instrument (Piano notamment : ses sons se chargent depuis internet) soit prêt
        // AVANT de démarrer le transport — sinon triggerAttackRelease échouait sur les premières
        // notes le temps du chargement (voir schedulePlayback, qui les ignore désormais proprement,
        // mais autant vraiment les jouer plutôt que de les sauter en silence).
        await waitForAudioReady();

        // Bouton « Boucle » du séquenceur : au lieu de s'arrêter, rejoue aussitôt depuis le début —
        // pratique pour tester un rythme en continu sans avoir à rappuyer sur Lecture. Stop (qui
        // annule tout ce qui est programmé sur le transport) coupe la boucle net à tout moment.
        Tone.Transport.schedule((t) => {
            Tone.Draw.schedule(() => {
                try {
                    this.refreshPreview();
                    if (this.seqLoopPlay) this.playCurrent();
                    else { this.isPlaying = false; this.updateSeqPlayhead(null); }
                } catch (e) {
                    console.warn('Fin de lecture ignorée :', e.message);
                    this.isPlaying = false;
                }
            }, t);
        }, 0.1 + (chord.beats * secPerBeat));

        Tone.Transport.start();
    }

    // Joue la chanson en entier : toutes les parties (couplet, refrain, ...) mises bout à bout, dans
    // leur ordre d'affichage. Si this.loopActiveSection est activé (bouton dédié), ne joue QUE la
    // partie active, et la boucle indéfiniment jusqu'à Stop (voir la fin de la fonction).
    async playProgression() {
        await Tone.start();
        this.stopAll();

        const sections = loadProgressionSections();
        // Plage à boucler (glisser sur les numéros de mesure, voir setLoopRange) : prioritaire sur le
        // bouton « Boucle » (partie active entière) quand elle est définie.
        const range = this.loopRange;
        const loop = !!range || this.loopActiveSection;
        const flat = []; // { section, index, data } à plat, dans l'ordre de lecture
        if (range) {
            const sec = sections[range.section];
            if (sec) {
                for (let ci = range.start; ci <= range.end && ci < sec.chords.length; ci++) {
                    flat.push({ section: range.section, index: ci, data: sec.chords[ci] });
                }
            }
        } else if (this.loopActiveSection) {
            const sec = sections[this.activeSection];
            if (sec) sec.chords.forEach((data, ci) => flat.push({ section: this.activeSection, index: ci, data }));
        } else {
            sections.forEach((sec, si) => sec.chords.forEach((data, ci) => flat.push({ section: si, index: ci, data })));
        }
        if (flat.length === 0) return;

        // Démarre depuis l'accord en surbrillance si présent, sinon depuis le tout début — non
        // pertinent en mode boucle : chaque tour rejoue la partie (ou la plage) depuis son tout début.
        let startPos = 0;
        if (!loop && this.selectedIndex != null) {
            const pos = flat.findIndex(c => c.section === this.activeSection && c.index === this.selectedIndex);
            if (pos >= 0) startPos = pos;
        }

        const bpm = parseInt(document.getElementById('bpm').value);
        const secPerBeat = 60 / bpm;
        const start = 0.1;

        // Décompte : un temps par mesure de la signature rythmique, accent sur le temps 1
        const COUNT_IN = this.beatsPerBar();
        const disp = document.getElementById('current-chord-display');
        for (let b = 0; b < COUNT_IN; b++) {
            const clickTime = start + b * secPerBeat;
            const accent = (b === 0);
            const label = b + 1;
            Tone.Transport.schedule((t) => {
                // Un filet à chaque callback programmé sur le transport (voir schedulePlayback) : une
                // seule exception, n'importe où, bloquait silencieusement tout le reste de la lecture.
                // metronomeCountIn (Paramètres > Son) ne coupe QUE le son : le décompte visuel et le
                // délai avant le premier accord restent identiques, pour ne rien changer au timing.
                if (this.metronomeCountIn) {
                    try {
                        this.playMetronomeClick(accent, t);
                    } catch (e) { console.warn('Clic de décompte ignoré :', e.message); }
                }
                Tone.Draw.schedule(() => {
                    disp.innerHTML = `Décompte<span class="chord-notes">${label} / ${COUNT_IN}</span>`;
                }, t);
            }, clickTime);
            // Clic faible sur le contretemps (croche entre ce temps et le suivant), voir metronomeSubdivision
            if (this.metronomeSubdivision) {
                const subTime = clickTime + secPerBeat / 2;
                Tone.Transport.schedule((t) => {
                    if (this.metronomeCountIn) {
                        try {
                            this.playMetronomeClick(false, t, true);
                        } catch (e) { console.warn('Clic de décompte (croche) ignoré :', e.message); }
                    }
                }, subTime);
            }
        }

        // La progression démarre juste après le décompte
        let timeOffset = start + COUNT_IN * secPerBeat;
        this.isPlaying = true;
        let songBeat = 0; // compteur de temps DEPUIS le début de la grille (pas le décompte) : le
                           // premier temps de la grille redevient un « temps 1 » accentué, comme il
                           // se doit, indépendamment du décompte qui précède.

        flat.slice(startPos).forEach(({ section, index, data }) => {
            const beats = beatsFromData(data);
            const chord = new Chord(data.root, data.quality, beats, data.inversion, data.drop, octaveFromData(data), data.bass);
            const notes = chord.getSeqNotes();
            const { pattern: seqPattern, tie: seqTie } = this.resolveSeqPatternForData(chord, data);
            this.schedulePlayback(notes, chord.getSeqMidiNotes(), seqPattern, seqTie, secPerBeat, timeOffset, chord.getRoleMap(), data.instrument || 'piano', chord, false, { section, index });

            // Métronome maintenu pendant la lecture (option activée) : un clic par temps de l'accord,
            // accentué sur le 1er temps de chaque mesure — indépendant des notes de l'accord jouées.
            if (this.metronomeDuringPlayback) {
                for (let b = 0; b < chord.beats; b++) {
                    const accent = (songBeat % COUNT_IN === 0);
                    const clickTime = timeOffset + b * secPerBeat;
                    Tone.Transport.schedule((t) => {
                        try {
                            this.playMetronomeClick(accent, t);
                        } catch (e) { console.warn('Clic de métronome ignoré :', e.message); }
                    }, clickTime);
                    // Clic faible sur le contretemps (croche), voir metronomeSubdivision
                    if (this.metronomeSubdivision) {
                        const subTime = clickTime + secPerBeat / 2;
                        Tone.Transport.schedule((t) => {
                            try {
                                this.playMetronomeClick(false, t, true);
                            } catch (e) { console.warn('Clic de métronome (croche) ignoré :', e.message); }
                        }, subTime);
                    }
                    songBeat++;
                }
            }

            // Au début de cet accord : maj de l'indicateur (nom + notes) et surbrillance dans la grille
            const chordUseFlats = this.useFlatsForRoot(chord.root);
            const labelHTML = `<span class="chord-title">${flatTight(chord.getLabel(chordUseFlats))}</span><span class="chord-notes">${chordNotesHtml(chord, chordUseFlats)}</span>`;
            Tone.Transport.schedule((t) => {
                Tone.Draw.schedule(() => {
                    try {
                        disp.innerHTML = labelHTML;
                        this.highlightPlaying(section, index);
                    } catch (e) {
                        console.warn('Surbrillance ignorée pour', section, index, ':', e.message);
                    }
                }, t);
            }, timeOffset);

            timeOffset += chord.beats * secPerBeat;
        });

        Tone.Transport.schedule((t) => {
            Tone.Draw.schedule(() => {
                try {
                    // Boucle encore active et lecture non interrompue entre-temps (bouton Stop) -> on
                    // relance directement un tour complet (avec son propre décompte) plutôt que de
                    // s'arrêter ; sinon, comportement habituel de fin de lecture.
                    if ((this.loopRange || this.loopActiveSection) && this.isPlaying) {
                        this.playProgression();
                    } else {
                        this.clearViz();
                        this.highlightPlaying(null, null);
                        this.isPlaying = false;
                    }
                } catch (e) {
                    console.warn('Fin de progression ignorée :', e.message);
                    this.isPlaying = false;
                }
            }, t);
        }, timeOffset);

        // Attend que tous les instruments utilisés dans la grille (Piano notamment : ses sons se
        // chargent depuis internet) soient prêts avant de démarrer le transport — la boucle ci-dessus
        // les a déjà tous instanciés en programmant leur lecture (voir getInstrument), il ne reste
        // qu'à attendre leur chargement. Sans ça, une note jouée trop tôt échouait silencieusement
        // (voir schedulePlayback, qui l'ignore désormais proprement), mais autant vraiment l'entendre.
        await waitForAudioReady();

        Tone.Transport.start();
    }

    // Surbrillance de l'accord en cours de lecture (sans re-render de la grille)
    highlightPlaying(section, index) {
        document.querySelectorAll('.grid-cell.playing').forEach(c => c.classList.remove('playing'));
        if (index == null) return;
        const cells = document.querySelectorAll(`.chord-grid[data-section="${section}"] .grid-cell[data-index="${index}"]`);
        cells.forEach(c => c.classList.add('playing'));
        this.updateGridPlayhead(section, index); // suit l'accord qui démarre, comme au clic (voir selectChord)
        // Suit la lecture dans la grille sur un morceau plus long que l'écran : ne scrolle QUE si la
        // case en cours sort du cadre visible ('nearest', pas 'center') — sinon ça re-scrollerait à
        // chaque accord même quand tout est déjà visible, gênant si l'utilisateur a délibérément
        // scrollé ailleurs (ex. pour regarder la suite pendant que ça joue).
        if (cells.length) cells[0].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }

    // Barre de lecture de la grille : petit repère à gauche de l'accord sélectionné au repos, qui
    // suit ensuite l'accord en cours pendant la lecture (voir highlightPlaying) — jamais effacée à
    // l'arrêt (contrairement à la surbrillance « playing »), elle marque où la lecture reprendrait.
    // Sans re-render de la grille : un simple élément déplacé/réinséré, comme highlightPlaying.
    updateGridPlayhead(section, index) {
        if (index == null) {
            this.playheadSection = section;
            this.playheadIndex = index;
            document.querySelectorAll('.grid-playhead').forEach(el => el.remove());
            return;
        }
        this.setGridPlayheadProgress(section, index, 0, 1); // position de repos : tout à gauche
    }

    // Fait glisser la barre de lecture le long de l'accord en cours, de la gauche vers la droite, au
    // fil des croches jouées (voir schedulePlayback/gridPos) — plutôt qu'un simple saut d'accord en
    // accord. `elapsedBeats`/`totalBeats` couvrent la durée ENTIÈRE de l'accord, qui peut être scindé
    // sur plusieurs cases si étiré au-delà d'une ligne (voir layoutProgression, seg-first/-mid/-last) :
    // chaque segment occupe `span` colonnes = `span` temps, on retrouve donc le bon segment et la
    // fraction qui lui correspond en consommant `elapsedBeats` case par case.
    setGridPlayheadProgress(section, index, elapsedBeats, totalBeats) {
        this.playheadSection = section;
        this.playheadIndex = index;
        const segs = Array.from(document.querySelectorAll(`.chord-grid[data-section="${section}"] .grid-cell[data-index="${index}"]`));
        if (segs.length === 0) {
            document.querySelectorAll('.grid-playhead').forEach(el => el.remove());
            return;
        }
        const spans = segs.map(seg => {
            const m = /span\s+(\d+)/.exec(seg.getAttribute('style') || '');
            return m ? parseInt(m[1], 10) : 1;
        });
        let remaining = totalBeats > 0 ? Math.max(0, Math.min(totalBeats, elapsedBeats)) : 0;
        let targetSeg = segs[0], fraction = 0;
        for (let i = 0; i < segs.length; i++) {
            if (i === segs.length - 1 || remaining < spans[i]) {
                targetSeg = segs[i];
                fraction = spans[i] > 0 ? Math.max(0, Math.min(1, remaining / spans[i])) : 0;
                break;
            }
            remaining -= spans[i];
        }
        // Réutilise la barre déjà en place si elle est déjà dans le bon segment (juste sa position qui
        // change) : la transition CSS (voir .grid-playhead) peut alors glisser au lieu de sauter d'une
        // croche à l'autre. Recrée seulement en changeant de segment/case (ou après un re-render).
        let bar = document.querySelector('.grid-playhead');
        if (!(bar && bar.parentElement === targetSeg)) {
            document.querySelectorAll('.grid-playhead').forEach(el => el.remove());
            bar = document.createElement('div');
            bar.className = 'grid-playhead';
            targetSeg.appendChild(bar);
        }
        bar.style.left = `${fraction * 100}%`;
    }

    // `insertAfter` (optionnel) : index après lequel insérer le nouvel accord, dans la partie active
    // (bouton « À la suite ») — ignoré en mode modification, et si absent l'accord est ajouté en fin
    // de partie comme avant (bouton « Ajouter »/« À la fin »).
    saveCurrent(insertAfter) {
        this.syncSeqPatternForCurrentChord(); // garantit un arpPattern à jour même si le panneau n'a jamais été ouvert
        const data = {
            root: document.getElementById('root').value,
            quality: document.getElementById('quality').value,
            beats: document.getElementById('duration').value,
            octave: document.getElementById('octave').value,
            inversion: document.getElementById('inversion').value,
            drop: document.getElementById('drop').value,
            bass: document.getElementById('bass').value || null,
            playStyle: document.getElementById('playStyle').value,
            instrument: document.getElementById('instrument').value,
            arpPattern: document.getElementById('arpPattern').value,
            seqEdited: true
        };
        const sections = loadProgressionSections();
        this.pushUndo(sections);
        const history = sections[this.activeSection].chords;

        if (this.editingIndex != null && history[this.editingIndex]) {
            history[this.editingIndex] = data; // modification en place
            this.exitEditMode();
        } else if (insertAfter != null && insertAfter >= 0 && insertAfter < history.length) {
            history.splice(insertAfter + 1, 0, data); // inséré juste après l'accord sélectionné
        } else {
            history.push(data); // nouvel accord en fin de partie
        }
        saveProgressionSections(sections);
        this.clearSeqHistory(); // motif validé dans la grille : plus rien à annuler/rétablir en local
        this.loadProgression();
    }

    // Construit les données d'un accord (fondamentale, sans renversement/drop/basse) à partir d'un
    // symbole déjà reconnu (voir parseChordSymbol) — partagé par addChordFromSymbol (un accord) et
    // addChordsFromSymbolList (plusieurs, séparés par "/").
    buildChordData(parsed, beats, playStyle, instrument) {
        const chord = new Chord(parsed.root, parsed.quality, beats, 0, 'none', 3, null);
        const voices = chord.getMidiNotes().length;
        const { pattern, tie } = seqPreset(playStyle, voices, beats * SEQ_STEPS_PER_BEAT);
        return {
            root: parsed.root,
            quality: parsed.quality,
            beats,
            octave: 3,
            inversion: 0,
            drop: 'none',
            bass: null,
            playStyle,
            instrument,
            arpPattern: serializeSeqPattern(pattern, tie),
            seqEdited: false,
        };
    }

    // Saisie rapide (voir parseChordSymbol) : ajoute directement un accord à la fin de la partie
    // active, toujours en position fondamentale (sans renversement/drop/basse — modifiables ensuite
    // en double-cliquant la case comme n'importe quel accord), à la durée et au style de lecture/
    // instrument actuellement réglés dans le panneau Accord. Pensée pour poser vite une grille au
    // clavier, sans toucher aux menus déroulants.
    // Ajoute un accord à partir d'un symbole texte (ex. "Cm7") à LA FIN d'une partie donnée — logique
    // commune à l'ajout rapide (#quick-add-input, toujours sur la partie ACTIVE) et à la case "+" en
    // bout de grille (une par partie, voir loadProgression/.cell-add-input) qui vise directement la
    // partie où elle apparaît. Renvoie true si l'accord a bien été ajouté.
    addChordFromSymbol(section, symbolStr) {
        const parsed = parseChordSymbol(symbolStr);
        if (!parsed) {
            this.flashHint('Accord non reconnu (ex. Cm7, F#dim, Bbadd9)');
            return false;
        }
        const beats = parseInt(document.getElementById('duration').value) || 4;
        const playStyle = document.getElementById('playStyle').value;
        const instrument = document.getElementById('instrument').value;
        const data = this.buildChordData(parsed, beats, playStyle, instrument);

        const sections = loadProgressionSections();
        this.pushUndo(sections);
        sections[section].chords.push(data);
        saveProgressionSections(sections);
        this.loadProgression();

        this.flashHint(`${noteNameForPc(NOTES.indexOf(parsed.root), this.useFlatsForRoot(parsed.root))}${QUALITY_LABEL[parsed.quality]} ajouté`);
        return true;
    }

    // Parse une liste "/" (ex. "CM7/Am7/F6/Bbm7") en tableau d'accords reconnus, ou renvoie null (en
    // affichant lequel a échoué) si un seul symbole n'est pas valide — tout ou rien, un ajout partiel
    // serait déroutant, mieux vaut corriger et retaper la liste entière.
    parseChordSymbolList(listStr) {
        const parts = listStr.split('/').map(p => p.trim()).filter(p => p.length > 0);
        if (parts.length === 0) return null;
        const parsedList = parts.map(p => parseChordSymbol(p));
        const badIndex = parsedList.findIndex(p => !p);
        if (badIndex !== -1) {
            this.flashHint(`Accord non reconnu : « ${parts[badIndex]} »`);
            return null;
        }
        return parsedList;
    }

    // Insère une liste déjà validée (voir parseChordSymbolList) dans une partie, un accord PAR
    // MESURE (beatsPerBar), toujours en fondamentale, sans renversement/drop/basse — `section` peut
    // valoir 'new' pour en créer une à la volée en même temps, dans le MÊME geste d'annulation (une
    // seule action pour l'utilisateur, voir openSectionPicker).
    commitChordList(section, parsedList) {
        const sections = loadProgressionSections();
        this.pushUndo(sections);
        if (section === 'new') {
            sections.push({ title: '', chords: [] });
            section = sections.length - 1;
        }
        const beats = this.beatsPerBar();
        const playStyle = document.getElementById('playStyle').value;
        const instrument = document.getElementById('instrument').value;
        parsedList.forEach(parsed => sections[section].chords.push(this.buildChordData(parsed, beats, playStyle, instrument)));
        saveProgressionSections(sections);
        this.activeSection = section;
        this.loadProgression();
        this.flashHint(`${parsedList.length} accords ajoutés (1 par mesure)`);
    }

    // Ajoute PLUSIEURS accords d'un coup, séparés par "/" — utilisé par la case "+" (voir
    // buildAddCellHtml), qui vise déjà sans équivoque la partie où elle apparaît : jamais besoin d'y
    // demander la destination, contrairement à l'ajout rapide (voir addQuickChord/openSectionPicker).
    addChordsFromSymbolList(section, listStr) {
        const parsedList = this.parseChordSymbolList(listStr);
        if (!parsedList) return false;
        this.commitChordList(section, parsedList);
        return true;
    }

    // Point d'entrée commun à la case "+" (voir buildAddCellHtml) : un symbole seul ajoute UN accord
    // à la durée réglée dans le panneau ; plusieurs séparés par "/" ajoutent un accord par mesure
    // d'un coup (voir addChordsFromSymbolList).
    addChordInputToSection(section, value) {
        return value.includes('/')
            ? this.addChordsFromSymbolList(section, value)
            : this.addChordFromSymbol(section, value);
    }

    // Ajout rapide (barre au-dessus de la grille) : un symbole seul ajoute directement à la partie
    // ACTIVE, comme avant. Plusieurs séparés par "/" : s'il y a plusieurs parties, demande d'abord où
    // les insérer (openSectionPicker) — ambigu sinon, contrairement à la case "+" qui vise déjà sans
    // équivoque la partie où elle apparaît.
    addQuickChord() {
        const input = document.getElementById('quick-add-input');
        const value = input.value;
        if (!value.includes('/')) {
            if (this.addChordFromSymbol(this.activeSection, value)) { input.value = ''; input.focus(); }
            return;
        }
        const parsedList = this.parseChordSymbolList(value);
        if (!parsedList) return;

        const sections = loadProgressionSections();
        if (sections.length <= 1) {
            this.commitChordList(0, parsedList);
            input.value = '';
            input.focus();
            return;
        }
        this.openSectionPicker(input, (section) => {
            this.commitChordList(section, parsedList);
            input.value = '';
            input.focus();
        });
    }

    // Popup léger (même style que le menu contextuel) demandant dans quelle partie insérer un ajout
    // en lot ("/", voir addQuickChord) quand il y en a plusieurs. `onPick(section)` est appelé avec
    // l'index choisi, ou 'new' pour en créer une à la volée (voir commitChordList).
    openSectionPicker(anchorEl, onPick) {
        const menu = document.getElementById('section-picker-menu');
        const sections = loadProgressionSections();
        menu.innerHTML = sections.map((sec, i) => {
            const label = (sec.title && sec.title.trim()) ? sec.title : `Partie ${i + 1}`;
            return `<button type="button" data-section-pick="${i}">${escapeHtml(label)}</button>`;
        }).join('') + `<button type="button" data-section-pick="new" class="section-pick-new">${svgIcon('plus')} Nouvelle partie</button>`;
        menu.querySelectorAll('button').forEach(btn => {
            btn.onclick = () => {
                this.closeSectionPicker();
                const val = btn.dataset.sectionPick;
                onPick(val === 'new' ? 'new' : parseInt(val));
            };
        });

        const rect = anchorEl.getBoundingClientRect();
        menu.hidden = false;
        const pad = 8;
        const left = Math.min(rect.left, window.innerWidth - menu.offsetWidth - pad);
        const top = Math.min(rect.bottom + 4, window.innerHeight - menu.offsetHeight - pad);
        menu.style.left = `${Math.max(pad, left)}px`;
        menu.style.top = `${Math.max(pad, top)}px`;
    }

    closeSectionPicker() {
        const menu = document.getElementById('section-picker-menu');
        if (menu) menu.hidden = true;
    }

    // Passe les contrôles en mode « modification » d'un accord existant
    editChord(section, index) {
        const sections = loadProgressionSections();
        const d = sections[section] && sections[section].chords[index];
        if (!d) return;
        this.activeSection = section;

        document.getElementById('root').value = d.root;
        this.revealComplexQualityIfNeeded(d.quality);
        // La basse différente n'est accessible qu'en mode accords complexes (voir toggle-bass) : un
        // accord qui en a une doit donc révéler ce mode même si sa qualité, elle, reste courante
        // (ex. Cmaj/D) — sinon le contrôle resterait affiché sans son bouton pour le rouvrir/masquer.
        if (d.bass) this.activateMoreOptions();
        document.getElementById('quality').value = d.quality;
        document.getElementById('duration').value = String(beatsFromData(d));
        this.syncDurationPicker(); // reflète la nouvelle valeur sur le bouton/menu d'icônes (voir setupDurationPicker)
        this.revealAdvancedIfNeeded(d);
        document.getElementById('octave').value = String(octaveFromData(d));
        document.getElementById('inversion').value = d.inversion;
        document.getElementById('drop').value = d.drop;
        document.getElementById('bass').value = d.bass || '';
        // Révèle le sélecteur de basse s'il était utilisé sur cet accord, pour qu'il reste visible
        // sans devoir cliquer sur le bouton dédié (voir toggle-bass) juste pour voir ce qu'on modifie.
        if (d.bass) {
            document.getElementById('bass-row').hidden = false;
            document.getElementById('toggle-bass').classList.add('active');
        }
        document.getElementById('playStyle').value = d.playStyle || 'held';
        this.syncPlayStylePicker(); // reflète la nouvelle valeur sur le bouton/menu d'icônes (voir setupPlayStylePicker)
        document.getElementById('instrument').value = d.instrument || 'piano';

        const chord = new Chord(d.root, d.quality, beatsFromData(d), d.inversion, d.drop, octaveFromData(d), d.bass);
        this.seqTouched = true; // le motif résolu ci-dessous fait autorité, on ne le régénère plus tant qu'on ne touche pas un réglage
        this.seqSelections = [];
        this.seqPage = 0; // nouvel accord chargé pour édition : on repart de sa première mesure
        this.clearSeqHistory(); // nouvel accord chargé pour édition : l'historique précédent ne s'applique plus
        const { pattern, tie } = this.resolveSeqPatternForData(chord, d);
        this.setLiveSeqPattern(pattern, tie);

        this.editingIndex = index;
        document.getElementById('save').innerHTML = svgIcon('check') + ' Modifier';
        document.getElementById('cancel-edit').hidden = false;
        this.updateEditActionsDocking();

        this.refreshPreview();
        this.renderSequencer();
        this.loadProgression();     // met en évidence la case en édition
        // remonte vers les contrôles pour voir ce qu'on modifie
        document.getElementById('current-chord-display').scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    cancelEdit() {
        this.exitEditMode();
        this.loadProgression();
    }

    exitEditMode() {
        this.editingIndex = null;
        document.getElementById('save').innerHTML = svgIcon('plus') + ' Ajouter';
        document.getElementById('cancel-edit').hidden = true;
        this.updateEditActionsDocking();
    }

    // Déplace le bloc Ajouter/À la suite/Annuler entre sa place normale (juste au-dessus de la carte
    // Morceau) et le pied de colonne ancré (.dock, au-dessus de la barre de lecture), selon qu'on est
    // en train de modifier un accord existant ou non — pour que ces boutons restent toujours visibles
    // pendant l'édition, sans avoir à remonter le panneau de réglages qui peut défiler. Le nœud DOM lui-
    // même est déplacé (pas dupliqué) : un seul jeu de boutons, mêmes ids, mêmes écouteurs.
    updateEditActionsDocking() {
        const editActions = document.getElementById('edit-actions');
        const dock = document.getElementById('footer-dock');
        const transport = dock && dock.querySelector('.transport');
        if (!editActions || !dock || !transport) return;
        if (this.editingIndex != null) {
            dock.insertBefore(editActions, transport);
        } else {
            const panelControls = document.querySelector('.panel-controls');
            panelControls.insertBefore(editActions, panelControls.lastElementChild);
        }
    }

    getRomanNumeral(globalRoot, globalMode, chordRoot, chordQuality) {
        const diff = (NOTES.indexOf(chordRoot) - NOTES.indexOf(globalRoot) + 12) % 12;

        // Dominante secondaire : un accord de dominante (7/9/11/13) qui n'est pas déjà LA dominante
        // de la tonalité, mais qui résout naturellement une quarte au-dessus sur un degré diatonique
        // -> chiffré "V7/x" (x = le degré ciblé, ex. "V7/V" pour un Ré7 en Do majeur) plutôt que
        // par son propre degré brut (qui donnerait à tort "II7").
        const DOMINANT_SUFFIX = { dom7: '7', dom9: '9', dom11: '11', dom13: '13' };
        if (DOMINANT_SUFFIX[chordQuality] && diff !== 7) {
            const scale = MODE_SCALES[globalMode] || MODE_SCALES.maj;
            const targetDiff = (diff + 5) % 12; // la quarte au-dessus = la tonique que cible cette dominante
            if (scale.includes(targetDiff)) {
                return `V${DOMINANT_SUFFIX[chordQuality]}/${diatonicNumeralFor(targetDiff, globalMode)}`;
            }
        }

        let numeral = romanMapFor(globalMode)[diff];

        const MINOR_FAMILY = ['min', 'min7', 'm6', 'm9', 'dim', 'dim7', 'm7b5'];
        if (MINOR_FAMILY.includes(chordQuality) || chordQuality.startsWith('min')) numeral = numeral.toLowerCase();

        if (chordQuality === 'dim' || chordQuality === 'dim7') numeral += '°';
        else if (chordQuality === 'm7b5') numeral += 'ø';
        else if (chordQuality === 'aug') numeral += '+';
        else if (chordQuality === 'sus2' || chordQuality === 'sus4') numeral += chordQuality;
        else {
            // Reprend le même chiffrage que le symbole (7, 9, 11, 13, 6...) pour maj7/dom7/min7
            // ainsi que les nouveaux types enrichis, sans re-préciser maj/m (déjà donné par la casse)
            const ROMAN_SUFFIX = {
                maj7: '7', dom7: '7', min7: '7',
                '6': '6', m6: '6',
                add9: '9', m9: '9', dom9: '9',
                add11: '11', dom11: '11', dom13: '13'
            };
            if (ROMAN_SUFFIX[chordQuality]) numeral += ROMAN_SUFFIX[chordQuality];
        }
        return numeral;
    }

    // Découpe la progression en segments (un accord peut être scindé sur plusieurs lignes).
    // barStart se calcule sur la position ABSOLUE (avant repli en lignes), pour que les barres de
    // mesure tombent au bon endroit même quand une ligne ne fait pas un multiple de la mesure.
    layoutProgression(history, beatsPerBar) {
        const beatsPerRow = beatsPerRowFor(beatsPerBar);
        let cursor = 0;
        const cells = [];
        history.forEach((h, i) => {
            let remaining = beatsFromData(h);
            let pos = cursor;
            const segs = [];
            while (remaining > 0) {
                const row = Math.floor(pos / beatsPerRow);
                const col = pos % beatsPerRow;
                const span = Math.min(remaining, beatsPerRow - col);
                // Limites de mesure INTERNES à ce segment (un accord qui dure plusieurs mesures sans
                // être coupé de ligne) : jamais à pos elle-même (déjà couverte par barStart), une par
                // mesure entièrement contenue dans le segment.
                const innerBars = [];
                for (let b = pos - (pos % beatsPerBar) + beatsPerBar; b < pos + span; b += beatsPerBar) {
                    innerBars.push({ offset: b - pos, barNumber: Math.floor(b / beatsPerBar) + 1 });
                }
                segs.push({ index: i, row, col, span, barStart: (pos % beatsPerBar === 0), barNumber: Math.floor(pos / beatsPerBar) + 1, innerBars });
                pos += span;
                remaining -= span;
            }
            segs.forEach((s, si) => {
                s.isFirst = (si === 0);
                s.isLast = (si === segs.length - 1);
                s.split = (segs.length > 1);
            });
            cells.push(...segs);
            cursor = pos;
        });
        return { cells, rows: Math.max(1, Math.ceil(cursor / beatsPerRow)), beatsPerRow, cursor };
    }

    // Rend TOUTES les parties (couplet, refrain, ...) : chacune a son titre éditable et sa propre
    // grille. Une seule est « active » à la fois (bordure d'accent) : c'est elle que ciblent les
    // contrôles (Ajouter/Modifier), Suppr, copier/coller, etc.
    loadProgression() {
        const host = document.getElementById('progression-sections');
        const sections = loadProgressionSections();
        if (this.activeSection >= sections.length) this.activeSection = sections.length - 1;

        const gRoot = document.getElementById('global-root').value;
        const gMode = document.getElementById('global-mode').value;
        const useFlats = useFlatsForKey(NOTES.indexOf(gRoot), gMode);
        const beatsPerBar = this.beatsPerBar();
        // Notation "Nt" = rejoué toutes les N temps (Nt stac. : en détaché) — délibérément distincte
        // du vocabulaire de la durée (Noire/Blanche/1 mesure...) affiché par ailleurs pour cet accord :
        // les deux se confondaient sinon (même mots, deux notions différentes — nombre d'appuis
        // PENDANT la durée, pas la durée elle-même). Voir aussi #playStyle dans index.html.
        const styleMap = {
            held: 'Tenu', pulsed: '1t stac.', arpeggio: 'Manuel',
            ronde_maintenu: '4t', ronde_staccato: '4t stac.',
            blanche_maintenu: '2t', blanche_staccato: '2t stac.',
            noire_maintenu: '1t', noire_staccato: '1t stac.',
            croche_maintenu: '½t', croche_staccato: '½t stac.'
        };
        const dragging = !!(this.drag && this.drag.moved);

        host.innerHTML = sections.map((sec, si) => {
            const history = sec.chords;
            const isActive = si === this.activeSection;
            let gridInner, gridStyle = '';

            if (history.length === 0) {
                const beatsPerRow = beatsPerRowFor(beatsPerBar);
                const plusSpan = Math.min(2, beatsPerRow);
                gridStyle = `grid-template-rows: repeat(1, var(--row-h) var(--measure-row-h)); grid-template-columns: repeat(${beatsPerRow}, 1fr);`;
                gridInner = this.buildAddCellHtml(si, 0, 0, plusSpan);
            } else {
                const { cells, rows: chordRows, beatsPerRow, cursor } = this.layoutProgression(history, beatsPerBar);
                // Case "+" (voir buildAddCellHtml) juste après le dernier accord : même ligne s'il
                // reste de la place, sinon ligne suivante — la grille (rows) doit alors en tenir compte.
                const plusCol = cursor % beatsPerRow;
                const plusRow = Math.floor(cursor / beatsPerRow);
                const plusSpan = Math.min(2, beatsPerRow - plusCol);
                const rows = Math.max(chordRows, plusRow + 1);
                // Une ligne de grille sur deux (impaire) porte les accords, l'autre (paire, fine et de
                // hauteur EXPLICITE --measure-row-h, jamais "auto" — plus robuste d'un navigateur à
                // l'autre qu'un dimensionnement intrinsèque basé sur le contenu) les numéros de mesure
                // juste en dessous. this.row se réfère toujours à une ligne d'ACCORDS (0, 1, 2...) :
                // ×2+1 pour sa ligne CSS, ×2+2 pour la ligne des numéros juste après elle (voir plus
                // bas, en fin de gridInner).
                gridStyle = `grid-template-rows: repeat(${rows}, var(--row-h) var(--measure-row-h)); grid-template-columns: repeat(${beatsPerRow}, 1fr);`;
                const loopRange = (this.loopRange && this.loopRange.section === si) ? this.loopRange : null;
                gridInner = cells.map(s => {
                    const h = history[s.index];
                    const roman = this.getRomanNumeral(gRoot, gMode, h.root, h.quality);
                    const styleLabel = styleMap[h.playStyle] || 'Tenu';
                    const chordUseFlats = useFlatsForChordRoot(NOTES.indexOf(h.root), NOTES.indexOf(gRoot), gMode, useFlats);
                    let sym = noteNameForPc(NOTES.indexOf(h.root), chordUseFlats) + (QUALITY_LABEL[h.quality] ?? '');
                    if (h.bass) sym += '/' + noteNameForPc(NOTES.indexOf(h.bass), chordUseFlats);

                    let cls = 'grid-cell';
                    if (dragging && this.drag.section === si && s.index === this.drag.index) {
                        // Copie (Ctrl+glisser / appui long+glisser, voir onGridPointerDown) : l'original
                        // reste en place, seule la case survolée (là où la copie s'insérerait) est
                        // signalée — contrairement au déplacement, qui hollow-out la case déplacée.
                        cls += this.drag.copy ? ' drop-target-copy' : ' drag-placeholder';
                    } else {
                        if (isActive && s.index === this.selectedIndex) cls += ' selected';
                        if (isActive && s.index === this.editingIndex) cls += ' editing';
                    }
                    const inLoop = loopRange && s.index >= loopRange.start && s.index <= loopRange.end;
                    if (inLoop) cls += ' in-loop-range';
                    // arrondis / bords de coupe selon la position du segment dans l'accord
                    if (s.split) cls += s.isFirst ? ' seg-first' : (s.isLast ? ' seg-last' : ' seg-mid');
                    // repère de début de mesure (barre de mesure)
                    if (s.barStart) cls += ' bar-start';
                    // police réduite pour les segments courts (peu de temps)
                    if (s.span === 1) cls += ' sz1'; else if (s.span === 2) cls += ' sz2';
                    // Zébrure d'une mesure sur deux (voir buildMeasureZebra), toujours affichée (y
                    // compris pour un accord court, contrairement à l'ancienne version limitée aux
                    // accords étalés sur plusieurs mesures).
                    const hasInnerBars = s.innerBars.length > 0;
                    const zebra = `background-image: ${buildMeasureZebra(s, beatsPerBar, beatsPerRow, inLoop)};`;
                    const style = `grid-column: ${s.col + 1} / span ${s.span}; grid-row: ${s.row * 2 + 1}; ${zebra}`;

                    const romanEl = s.isFirst ? `<span class="cell-roman">${roman}</span>` : '';
                    const metaEl = s.isFirst ? `<span class="cell-meta">${styleLabel}</span>` : '';
                    const contFlag = (s.split && !s.isFirst) ? ' <span class="cell-cont">↩</span>' : '';
                    // Petits traits à chaque limite de mesure interne, positionnés en % de la largeur du
                    // segment (colonnes de largeur égale au sein d'une même grille) — le dégradé qui les
                    // compose (voir .cell-tick) les estompe vers le centre pour ne jamais couper le texte.
                    const ticksEl = hasInnerBars
                        ? s.innerBars.map(ib => `<span class="cell-tick" style="left: ${(ib.offset / s.span) * 100}%;"></span>`).join('')
                        : '';
                    // Poignées d'étirement (durée) : bord droit sur le DERNIER segment (change la fin
                    // de l'accord), bord gauche sur le PREMIER segment s'il existe un accord précédent
                    // dans la même partie (change son début, en empruntant/rendant des temps à ce
                    // précédent — voir onResizeStart) ; absentes pendant un glisser-déposer.
                    const notDragging = !cls.includes('drag-placeholder');
                    const resizeRightEl = (s.isLast && notDragging)
                        ? `<div class="cell-resize cell-resize-right" data-section="${si}" data-index="${s.index}" data-edge="right" title="Glisser pour changer la durée"></div>` : '';
                    const resizeLeftEl = (s.isFirst && s.index > 0 && notDragging)
                        ? `<div class="cell-resize cell-resize-left" data-section="${si}" data-index="${s.index}" data-edge="left" title="Glisser pour changer la durée"></div>` : '';

                    return `
                    <div class="${cls}" data-section="${si}" data-index="${s.index}" style="${style}" title="Toucher pour écouter · cliquer le nom pour le modifier · double-clic/double-tap pour l'édition complète · clic droit/appui long pour plus d'options">
                        ${romanEl}
                        <span class="cell-sym">${sym}${contFlag}</span>
                        ${metaEl}
                        ${ticksEl}
                        ${resizeLeftEl}
                        ${resizeRightEl}
                    </div>`;
                }).join('') + cells.filter(s => s.barStart).map(s => `
                    <div class="row-measure" style="grid-column: ${s.col + 1} / span 1; grid-row: ${s.row * 2 + 2};">${s.barNumber}</div>`
                ).join('') + cells.flatMap(s => s.innerBars.map(ib => `
                    <div class="row-measure" style="grid-column: ${s.col + ib.offset + 1} / span 1; grid-row: ${s.row * 2 + 2};">${ib.barNumber}</div>`)
                ).join('') + this.buildLoopRangeBars(cells, loopRange)
                + this.buildAddCellHtml(si, plusRow, plusCol, plusSpan);
            }

            const titleVal = (sec.title || '').replace(/"/g, '&quot;');
            const canDelete = sections.length > 1;
            const measureCountEl = history.length > 0 ? `<span class="prog-section-measures">${sectionMeasureCount(sec, beatsPerBar)} mes.</span>` : '';
            return `
            <div class="prog-section">
                <div class="prog-section-head">
                    <input type="text" class="prog-title" data-section="${si}" placeholder="Section" value="${titleVal}">
                    ${measureCountEl}
                    <button type="button" class="icon-btn prog-section-duplicate" data-section="${si}" title="Dupliquer cette partie" aria-label="Dupliquer cette partie">${svgIcon('duplicate')}</button>
                    ${canDelete ? `<button type="button" class="prog-section-del" data-section="${si}" title="Supprimer cette partie" aria-label="Supprimer cette partie">${svgIcon('trash')}</button>` : ''}
                </div>
                <div class="chord-grid" data-section="${si}" data-beats-per-row="${beatsPerRowFor(beatsPerBar)}" style="${gridStyle}">${gridInner}</div>
            </div>`;
        }).join('');

        host.querySelectorAll('.prog-title').forEach(input => {
            input.addEventListener('focus', () => this.setActiveSection(+input.dataset.section));
            input.addEventListener('change', () => this.renameSection(+input.dataset.section, input.value));
            input.addEventListener('keydown', (e) => { if (e.key === 'Enter') input.blur(); });
        });
        host.querySelectorAll('.prog-section-del').forEach(btn => {
            btn.onclick = (e) => { e.stopPropagation(); this.deleteSection(+btn.dataset.section); };
        });
        host.querySelectorAll('.prog-section-duplicate').forEach(btn => {
            btn.onclick = (e) => { e.stopPropagation(); this.duplicateSection(+btn.dataset.section); };
        });
        // Clic droit (ordinateur) / appui long (tactile) sur un accord : menu Modifier/Dupliquer/
        // Supprimer — remplace les petits boutons ✎/⧉ jusque-là superposés à la case (illisibles et
        // quasi impossibles à toucher précisément au doigt sur téléphone).
        host.querySelectorAll('.grid-cell').forEach(cell => {
            const section = +cell.dataset.section, index = +cell.dataset.index;
            this.attachContextMenuTrigger(cell, () => ({ type: 'chord', section, index }));
        });
        // Poignées d'étirement : glisser un bord d'un accord change sa durée sans repasser par le
        // panneau Accord. stopPropagation empêche aussi le glisser-déposer (réordonner) de la grille
        // de se déclencher pour le même geste (délégué plus haut, sur #progression-sections).
        host.querySelectorAll('.cell-resize').forEach(handle => {
            handle.addEventListener('pointerdown', (e) => this.onResizeStart(e, +handle.dataset.section, +handle.dataset.index, handle.dataset.edge));
        });

        this.updateSaveButtons();
        this.updateGlobalUndoRedoButtons();
        // La grille vient d'être entièrement reconstruite (nouveau HTML) : la barre de lecture, elle,
        // n'est jamais réinsérée dans le gabarit lui-même (voir updateGridPlayhead) — la replacer ici
        // sinon un ré-rendu la ferait simplement disparaître.
        this.updateGridPlayhead(this.playheadSection, this.playheadIndex);
    }

    // Bascule Ajouter / (À la suite + À la fin) / Modifier selon le contexte : un accord sélectionné
    // dans la partie active, autre que le dernier, permet d'insérer juste après lui plutôt qu'en fin
    // de partie. Appelé à chaque re-rendu de la grille (loadProgression), qui reflète toujours l'état
    // courant de sélection/édition.
    updateSaveButtons() {
        const saveBtn = document.getElementById('save');
        const insertBtn = document.getElementById('save-insert');
        if (this.editingIndex != null) {
            saveBtn.innerHTML = svgIcon('check') + ' Modifier';
            insertBtn.hidden = true;
            return;
        }
        const sections = loadProgressionSections();
        const history = sections[this.activeSection] && sections[this.activeSection].chords;
        const canInsert = this.selectedIndex != null && history && this.selectedIndex < history.length - 1;
        saveBtn.innerHTML = svgIcon('plus') + (canInsert ? ' À la fin' : ' Ajouter');
        insertBtn.hidden = !canInsert;
    }

    // Rend une partie « active » : c'est elle que ciblent Ajouter/Modifier/Suppr/copier-coller
    setActiveSection(s) {
        if (s === this.activeSection) return;
        if (this.editingIndex != null) this.exitEditMode();
        this.activeSection = s;
        this.selectedIndex = null;
        this.loadProgression();
    }

    // Bouton « + Ajouter une partie » : nouvelle partie vide, aussitôt active, prête à être nommée
    addSection() {
        const sections = loadProgressionSections();
        this.pushUndo(sections);
        sections.push({ title: '', chords: [] });
        saveProgressionSections(sections);
        if (this.editingIndex != null) this.exitEditMode();
        this.activeSection = sections.length - 1;
        this.selectedIndex = null;
        this.loadProgression();
        const input = document.querySelector(`.prog-title[data-section="${this.activeSection}"]`);
        if (input) input.focus();
    }

    renameSection(s, title) {
        const sections = loadProgressionSections();
        if (!sections[s]) return;
        this.pushUndo(sections);
        sections[s].title = title;
        saveProgressionSections(sections);
    }

    // Supprime une partie entière (demande confirmation si elle contient des accords)
    deleteSection(s) {
        const sections = loadProgressionSections();
        if (sections.length <= 1 || !sections[s]) return;
        const sec = sections[s];
        if (sec.chords.length > 0) {
            const label = sec.title || `Partie ${s + 1}`;
            if (!confirm(`Supprimer « ${label} » et ses ${sec.chords.length} accord(s) ?`)) return;
        }
        this.pushUndo(sections);
        sections.splice(s, 1);
        saveProgressionSections(sections);

        if (this.activeSection === s && this.editingIndex != null) this.exitEditMode();
        if (this.activeSection >= sections.length) this.activeSection = sections.length - 1;
        else if (this.activeSection > s) this.activeSection--;
        this.selectedIndex = null;

        this.loadProgression();
    }

    // Duplique une partie entière (titre + tous ses accords), juste après elle — même esprit que
    // dupliquer un seul accord (bouton ⧉ de chaque case), mais pour toute une partie d'un coup (ex.
    // partir d'un couplet existant pour en écrire un second plutôt que de tout reconstruire à la main).
    duplicateSection(s) {
        const sections = loadProgressionSections();
        const sec = sections[s];
        if (!sec) return;
        this.pushUndo(sections);
        const copy = { title: sec.title ? `${sec.title} (copie)` : '', chords: sec.chords.map(c => ({ ...c })) };
        sections.splice(s + 1, 0, copy);
        saveProgressionSections(sections);
        this.activeSection = s + 1;
        this.selectedIndex = null;
        this.loadProgression();
    }

    // Transpose TOUT le morceau (toutes les parties) de `semitones` demi-tons, et décale la tonalité
    // globale d'autant pour qu'elle reste cohérente avec les accords transposés (mêmes chiffrages
    // romains qu'avant la transposition).
    transposeSong(semitones) {
        const sections = loadProgressionSections();
        if (sections.every(sec => sec.chords.length === 0)) return;
        this.pushUndo(sections);
        sections.forEach(sec => { sec.chords = sec.chords.map(c => transposeChordData(c, semitones)); });
        saveProgressionSections(sections);

        const rootSel = document.getElementById('global-root');
        rootSel.value = NOTES[(NOTES.indexOf(rootSel.value) + semitones + 1200) % 12];
        hasUnsavedChanges = true;
        this.updateKeyLabels();

        this.loadProgression();
        this.refreshPreview();
    }

    // ---------- Morceaux : enregistrer/charger plusieurs chansons séparées ----------

    // Avant de quitter le tampon actuel (nouveau morceau, en charger un autre, fermer la page...) :
    // si des modifications ne sont pas enregistrées (voir hasUnsavedChanges/saveCurrentSong), prévient
    // qu'elles seront perdues — que le morceau ait déjà un nom ou non, contrairement à l'ancien
    // comportement (qui ne prévenait que pour un morceau jamais enregistré, puisque tout le reste
    // s'auto-sauvegardait aussitôt).
    confirmDiscardUnsavedIfNeeded() {
        if (!hasUnsavedChanges) return true;
        return confirm('Des modifications ne sont pas enregistrées et seront perdues. Continuer ?');
    }

    refreshSongList() {
        const select = document.getElementById('song-select');
        if (!select) return;
        const songs = loadSongs().slice().sort((a, b) => b.savedAt - a.savedAt);
        const currentId = getCurrentSongId();
        select.innerHTML = `<option value="">— Non enregistré —</option>` +
            songs.map(s => `<option value="${s.id}">${escapeHtml(s.name)}</option>`).join('');
        select.value = currentId || '';
        document.getElementById('song-save').title = 'Enregistrer (Ctrl+S)';
    }

    onSongSelectChange(id) {
        if (id === (getCurrentSongId() || '')) return;
        if (!this.confirmDiscardUnsavedIfNeeded()) { this.refreshSongList(); return; }
        if (!id) this.newSong(true);
        else this.loadSong(id);
    }

    // Repart d'un morceau vierge (tonalité C majeur, 120 BPM, une partie sans titre)
    newSong(skipConfirm) {
        if (!skipConfirm && !this.confirmDiscardUnsavedIfNeeded()) return;
        setCurrentSongId(null);
        document.getElementById('global-root').value = 'C';
        document.getElementById('global-mode').value = 'maj';
        document.getElementById('time-sig').value = '4/4';
        document.getElementById('groove').value = 'straight';
        document.getElementById('bpm').value = 120;
        document.getElementById('bpm-val').value = '120';
        saveProgressionSections([{ title: '', chords: [] }], false); // nouveau tampon vierge, rien à enregistrer
        hasUnsavedChanges = false;
        this.clearHistory(); // changement de morceau : l'historique annuler/rétablir n'a plus de sens
        this.activeSection = 0;
        this.selectedIndex = null;
        if (this.editingIndex != null) this.exitEditMode();
        this.updateKeyLabels();
        this.updateDurationOptions();
        this.loadProgression();
        this.refreshPreview();
        this.refreshSongList();
    }

    // Charge un morceau enregistré : il devient le morceau ouvert, mais n'est plus auto-sauvegardé en
    // continu (voir hasUnsavedChanges/saveCurrentSong) — il faut Enregistrer/Ctrl+S pour persister
    // toute modification ultérieure.
    loadSong(id) {
        const song = loadSongs().find(s => s.id === id);
        if (!song) return;
        setCurrentSongId(id);
        document.getElementById('global-root').value = song.root || 'C';
        this.revealComplexModeIfNeeded(song.mode || 'maj');
        document.getElementById('global-mode').value = song.mode || 'maj';
        document.getElementById('time-sig').value = song.timeSig || '4/4';
        document.getElementById('groove').value = song.groove || 'straight';
        document.getElementById('bpm').value = song.bpm || 120;
        document.getElementById('bpm-val').value = String(song.bpm || 120);
        saveProgressionSections(song.sections && song.sections.length ? song.sections : [{ title: '', chords: [] }], false);
        hasUnsavedChanges = false; // tampon tout juste chargé, identique au morceau enregistré
        this.clearHistory(); // changement de morceau : l'historique annuler/rétablir n'a plus de sens
        this.activeSection = 0;
        this.selectedIndex = null;
        if (this.editingIndex != null) this.exitEditMode();
        this.updateKeyLabels();
        this.updateDurationOptions();
        this.loadProgression();
        this.refreshPreview();
        this.refreshSongList();
    }

    // Enregistre RÉELLEMENT les modifications (bouton « Enregistrer » / Ctrl+S) : écrase le morceau
    // déjà ouvert avec l'état actuel du tampon de travail — plus aucune auto-sauvegarde en continu
    // (voir hasUnsavedChanges), c'est désormais le SEUL moment où le morceau enregistré change.
    // Si aucun morceau n'est encore ouvert, il faut bien lui donner un nom une première fois :
    // se comporte alors comme « Enregistrer sous » (voir saveCurrentAsSong).
    saveCurrentSong() {
        const id = getCurrentSongId();
        if (!id) { this.saveCurrentAsSong(); return; }
        syncCurrentSong({
            sections: loadProgressionSections(),
            root: document.getElementById('global-root').value,
            mode: document.getElementById('global-mode').value,
            timeSig: document.getElementById('time-sig').value,
            groove: document.getElementById('groove').value,
            bpm: parseInt(document.getElementById('bpm').value),
        });
        hasUnsavedChanges = false;
        this.refreshSongList();
        this.flashHint('Morceau enregistré');
    }

    // Enregistre l'état actuel comme un NOUVEAU morceau (appelé uniquement quand aucun morceau n'est
    // encore ouvert — voir saveCurrentSong et les export PDF/MIDI/MP3, qui en ont besoin pour nommer
    // le fichier). Le select se cache et un champ de saisie apparaît à sa place, plutôt qu'un prompt()
    // natif pour choisir le nom du morceau à enregistrer.
    saveCurrentAsSong() {
        const select = document.getElementById('song-select');
        if (!select || select.hidden) return; // déjà en cours de saisie

        select.hidden = true;
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'compact song-select-full inline-rename-input';
        input.placeholder = 'Nom du morceau…';
        select.insertAdjacentElement('afterend', input);
        input.focus();

        const finish = () => { input.remove(); select.hidden = false; };
        const commit = () => {
            const name = input.value.trim() || 'Sans titre';
            const song = {
                id: 'song_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
                name,
                savedAt: Date.now(),
                root: document.getElementById('global-root').value,
                mode: document.getElementById('global-mode').value,
                timeSig: document.getElementById('time-sig').value,
                groove: document.getElementById('groove').value,
                bpm: parseInt(document.getElementById('bpm').value),
                sections: loadProgressionSections()
            };
            const songs = loadSongs();
            songs.push(song);
            saveSongs(songs);
            setCurrentSongId(song.id);
            hasUnsavedChanges = false;
            this.refreshSongList();
            this.flashHint(`« ${song.name} » enregistré`);
            finish();
        };
        input.addEventListener('blur', commit);
        input.addEventListener('keydown', (e) => {
            e.stopPropagation();
            if (e.key === 'Enter') { e.preventDefault(); input.blur(); }
            else if (e.key === 'Escape') { e.preventDefault(); input.removeEventListener('blur', commit); finish(); }
        });
    }

    // Renomme EN PLACE (même id) le morceau actuellement ouvert — double-clic/double-tap sur son
    // titre (voir wiring dans setupEventListeners), à la place de l'ancien bouton dédié « Enregistrer
    // sous... ». Ne fait rien si rien n'est encore enregistré : pas de nom à changer, il faut d'abord
    // « Enregistrer » une première fois (voir saveCurrentAsSong).
    startInlineRenameSongMain() {
        const id = getCurrentSongId();
        if (!id) { this.flashHint('Enregistre d\'abord ce morceau pour pouvoir le renommer'); return; }
        const songs = loadSongs();
        const song = songs.find(s => s.id === id);
        if (!song) return;
        const select = document.getElementById('song-select');
        if (!select || select.hidden) return; // déjà en cours de saisie (ex. Enregistrer)

        select.hidden = true;
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'compact song-select-full inline-rename-input';
        input.value = song.name;
        select.insertAdjacentElement('afterend', input);
        input.focus();
        input.select();

        let done = false;
        const finish = () => { input.remove(); select.hidden = false; };
        const commit = () => {
            if (done) return;
            done = true;
            const val = input.value.trim();
            if (val && val !== song.name) {
                this.pushFilesUndo();
                song.name = val;
                saveSongs(songs);
            }
            finish();
            this.refreshSongList();
        };
        input.addEventListener('blur', commit);
        input.addEventListener('keydown', (e) => {
            e.stopPropagation();
            if (e.key === 'Enter') { e.preventDefault(); input.blur(); }
            else if (e.key === 'Escape') { e.preventDefault(); done = true; input.removeEventListener('blur', commit); finish(); }
        });
    }

    // ---------- Fenêtre Paramètres ----------
    // Toujours affichée en une seule vue qui défile, sans onglet : Son en premier (le réglage le
    // plus utilisé), puis Fichiers en dessous. Ajouter une future section = un nouveau <section> +
    // sa fonction de rendu, appelée ici, rien d'autre à repenser.
    openSettings() {
        this.settingsOpen = true;
        document.getElementById('settings-overlay').hidden = false;
        document.getElementById('open-settings').classList.add('active');
        this.renderAudioPanel();
        this.renderFilesPanel();
        this.updateGlobalUndoRedoButtons(); // le bouton unique repointe vers l'historique Fichiers
    }

    closeSettings() {
        this.settingsOpen = false;
        document.getElementById('settings-overlay').hidden = true;
        document.getElementById('open-settings').classList.remove('active');
        this.updateGlobalUndoRedoButtons();
    }

    // ---- Panneau Son : volume général (maître), puis volume du métronome ----
    renderAudioPanel() {
        const host = document.getElementById('settings-panel-audio');
        if (!host) return;
        host.innerHTML = `
            <div class="settings-slider-row">
                <div class="settings-slider-head">
                    <label for="general-volume">Volume général</label>
                    <span class="val" id="general-volume-val">${this.generalVolumePercent}</span>
                </div>
                <input type="range" id="general-volume" min="0" max="100" value="${this.generalVolumePercent}">
            </div>
            <div class="settings-slider-sep"></div>
            <div class="settings-slider-row">
                <div class="settings-slider-head">
                    <label for="metronome-volume">Volume du métronome</label>
                    <span class="val" id="metronome-volume-val">${this.metronomeVolumePercent}</span>
                </div>
                <input type="range" id="metronome-volume" min="0" max="100" value="${this.metronomeVolumePercent}">
            </div>
            <div class="settings-select-row">
                <label for="metronome-sound">Son du métronome</label>
                <select id="metronome-sound">
                    ${Object.entries(METRONOME_SOUNDS).map(([key, s]) =>
                        `<option value="${key}"${key === this.metronomeSoundKey ? ' selected' : ''}>${s.label}</option>`
                    ).join('')}
                </select>
            </div>
            <div class="settings-slider-sep"></div>
            <div class="settings-toggle-row">
                <label for="toggle-autoplay-select">Jouer l'accord en le sélectionnant dans la grille</label>
                <button type="button" id="toggle-autoplay-select" class="switch" role="switch" aria-checked="${this.autoplaySelect}" aria-label="Jouer l'accord en le sélectionnant dans la grille">
                    <span class="switch-thumb"></span>
                </button>
            </div>
            <div class="settings-toggle-row">
                <label for="toggle-metronome-countin">Clics du décompte avant la lecture de la grille</label>
                <button type="button" id="toggle-metronome-countin" class="switch" role="switch" aria-checked="${this.metronomeCountIn}" aria-label="Clics du décompte avant la lecture de la grille">
                    <span class="switch-thumb"></span>
                </button>
            </div>
            <div class="settings-slider-hint">Le volume général s'applique en plus du réglage spécifique ci-dessus, sans changer son équilibre par rapport aux accords. Le tempo se règle dans la carte « Morceau » (cliquer sur sa valeur permet de la saisir directement au clavier).</div>`;

        document.getElementById('general-volume').oninput = (e) => this.setGeneralVolume(+e.target.value);
        document.getElementById('metronome-volume').oninput = (e) => this.setMetronomeVolume(+e.target.value);
        document.getElementById('metronome-sound').onchange = (e) => this.setMetronomeSound(e.target.value);
        document.getElementById('toggle-autoplay-select').onclick = () => this.setAutoplaySelect(!this.autoplaySelect);
        document.getElementById('toggle-metronome-countin').onclick = () => this.setMetronomeCountIn(!this.metronomeCountIn);
    }

    setAutoplaySelect(on) {
        this.autoplaySelect = on;
        localStorage.setItem(AUTOPLAY_SELECT_KEY, on ? '1' : '0');
        const btn = document.getElementById('toggle-autoplay-select');
        if (btn) btn.setAttribute('aria-checked', on);
    }

    setMetronomeCountIn(on) {
        this.metronomeCountIn = on;
        localStorage.setItem(METRONOME_COUNTIN_KEY, on ? '1' : '0');
        const btn = document.getElementById('toggle-metronome-countin');
        if (btn) btn.setAttribute('aria-checked', on);
    }

    setGeneralVolume(percent) {
        this.generalVolumePercent = percent;
        Tone.Destination.volume.value = percentToDb(percent);
        const val = document.getElementById('general-volume-val');
        if (val) val.textContent = percent;
        localStorage.setItem(GENERAL_VOLUME_KEY, String(percent));
    }

    setMetronomeVolume(percent) {
        this.metronomeVolumePercent = percent;
        this.metronome.volume.value = percentToDb(percent);
        const val = document.getElementById('metronome-volume-val');
        if (val) val.textContent = percent;
        localStorage.setItem(METRONOME_VOLUME_KEY, String(percent));
    }

    // Point d'entrée UNIQUE pour faire sonner le métronome, quel que soit le son choisi (voir
    // METRONOME_SOUNDS) : chaque sonorité sait comment se déclencher elle-même (hauteur ou volume
    // selon le cas), les deux endroits qui font cliquer le métronome n'ont pas à s'en soucier.
    playMetronomeClick(accent, time, sub = false) {
        METRONOME_SOUNDS[this.metronomeSoundKey].trigger(this.metronome, accent, time, sub);
    }

    // Tap tempo : cliquer plusieurs fois au rythme voulu règle le BPM sans avoir à connaître ni taper
    // une valeur précise. Repart de zéro si plus de 2s s'écoulent entre deux taps (on considère alors
    // une nouvelle estimation, pas la continuation d'un tempo très lent) ; ne garde que les 8 derniers
    // taps pour rester réactif à un changement de rythme en cours de route plutôt que de figer une
    // moyenne sur toute la session.
    handleTapTempo() {
        const now = performance.now();
        if (this.tapTimes.length > 0 && now - this.tapTimes[this.tapTimes.length - 1] > 2000) this.tapTimes = [];
        this.tapTimes.push(now);
        if (this.tapTimes.length > 8) this.tapTimes.shift();

        if (this.tapTimes.length >= 2) {
            const intervals = [];
            for (let i = 1; i < this.tapTimes.length; i++) intervals.push(this.tapTimes[i] - this.tapTimes[i - 1]);
            const avgMs = intervals.reduce((a, b) => a + b, 0) / intervals.length;
            const bpm = Math.min(240, Math.max(60, Math.round(60000 / avgMs)));
            document.getElementById('bpm').value = bpm;
            document.getElementById('bpm-val').value = bpm;
            hasUnsavedChanges = true;
        }

        // Flash bref pour confirmer que le tap a bien été pris en compte, même avant qu'un BPM
        // puisse être calculé (dès le tout premier tap)
        const btn = document.getElementById('tap-tempo');
        btn.classList.add('tapped');
        clearTimeout(this._tapFlashTimer);
        this._tapFlashTimer = setTimeout(() => btn.classList.remove('tapped'), 120);
    }

    // Change le son du métronome : l'ancien instrument est proprement libéré (.dispose()) avant de
    // construire le nouveau, et un petit aperçu (temps normal + temps accentué) se joue aussitôt pour
    // l'entendre sans devoir lancer toute une lecture.
    setMetronomeSound(key) {
        if (!METRONOME_SOUNDS[key] || key === this.metronomeSoundKey) return;
        this.metronome.dispose();
        this.metronomeSoundKey = key;
        this.metronome = METRONOME_SOUNDS[key].build().toDestination();
        this.metronome.volume.value = percentToDb(this.metronomeVolumePercent);
        localStorage.setItem(METRONOME_SOUND_KEY, key);

        Tone.start().then(() => {
            const now = Tone.now();
            this.playMetronomeClick(false, now);
            this.playMetronomeClick(true, now + 0.35);
        });
    }

    // Regroupe les morceaux enregistrés par dossier, avec pour chacun : ouvrir, déplacer, renommer,
    // supprimer — et pour chaque dossier : renommer, supprimer (avec confirmation).
    renderFilesPanel() {
        const host = document.getElementById('settings-panel-files');
        if (!host) return;
        const songs = loadSongs().slice().sort((a, b) => b.savedAt - a.savedAt);

        // Migration douce : un morceau peut référencer un dossier jamais inscrit au registre (créé
        // avant l'ajout de ce registre, ou par l'ancien raccourci « + Nouveau dossier » d'un select) —
        // on rattrape ça ici une bonne fois pour toutes, silencieusement.
        let folders = loadFolders();
        const referenced = new Set(songs.map(s => s.folder).filter(Boolean));
        const merged = [...new Set([...folders, ...referenced])];
        if (merged.length !== folders.length) { folders = merged; saveFolders(folders); }
        folders = folders.slice().sort((a, b) => a.localeCompare(b, 'fr'));

        const currentId = getCurrentSongId();

        const toolbar = `
            <div class="files-toolbar">
                <button type="button" id="new-folder-btn" class="btn-sec">
                    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/><path d="M12 11v4M10 13h4"/></svg>
                    Nouveau dossier
                </button>
                <div class="files-toolbar-spacer"></div>
                <button type="button" id="library-export-btn" class="icon-btn" title="Exporter toute la bibliothèque (sauvegarde)" aria-label="Exporter toute la bibliothèque">
                    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12"/><path d="m7 11 5 5 5-5"/><path d="M5 21h14"/></svg>
                </button>
                <button type="button" id="library-import-btn" class="icon-btn" title="Importer une bibliothèque (restauration)" aria-label="Importer une bibliothèque">
                    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21V9"/><path d="m7 13 5-5 5 5"/><path d="M5 3h14"/></svg>
                </button>
                <input type="file" id="library-import-input" accept="application/json" hidden>
            </div>`;

        if (songs.length === 0 && folders.length === 0) {
            host.innerHTML = toolbar + `<div class="files-empty">Aucun morceau enregistré pour l'instant.<br>Utilise « 💾 Enregistrer » dans la carte Morceau.</div>`;
            this.wireFilesToolbar();
            return;
        }

        const groups = folders.map(name => ({ name, songs: songs.filter(s => s.folder === name) }));
        groups.push({ name: null, songs: songs.filter(s => !s.folder) });

        const folderOptions = (current) => {
            let opts = `<option value=""${!current ? ' selected' : ''}>Sans dossier</option>`;
            folders.forEach(f => { opts += `<option value="${escapeHtml(f)}"${f === current ? ' selected' : ''}>${escapeHtml(f)}</option>`; });
            opts += `<option value="__new__">+ Nouveau dossier…</option>`;
            return opts;
        };

        const fmtDate = (ts) => new Date(ts).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
        const chordCount = (song) => (song.sections || []).reduce((n, sec) => n + (sec.chords ? sec.chords.length : 0), 0);

        host.innerHTML = toolbar + groups.filter(g => g.name !== null || g.songs.length > 0).map(g => `
            <details class="file-group" open>
                <summary>
                    <svg class="icon chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>
                    <span class="file-group-name" data-folder="${escapeHtml(g.name || '')}">${g.name ? escapeHtml(g.name) : 'Sans dossier'}</span>
                    <span class="count">(${g.songs.length})</span>
                    ${g.name ? `
                    <span class="file-group-actions">
                        <button type="button" class="icon-btn" data-folder-action="rename" data-folder="${escapeHtml(g.name)}" title="Renommer le dossier" aria-label="Renommer le dossier" onclick="event.stopPropagation()">
                            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                        </button>
                        <button type="button" class="icon-btn" data-folder-action="delete" data-folder="${escapeHtml(g.name)}" title="Supprimer le dossier" aria-label="Supprimer le dossier" onclick="event.stopPropagation()">
                            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                        </button>
                    </span>` : ''}
                </summary>
                ${g.songs.length === 0 ? `<div class="file-group-empty">Dossier vide</div>` : g.songs.map(s => `
                    <div class="file-row" data-id="${s.id}">
                        <div class="file-info">
                            <span class="file-name">${escapeHtml(s.name)}${s.id === currentId ? ' — <em>ouvert</em>' : ''}</span>
                            <span class="file-meta">${chordCount(s)} accord(s) · ${fmtDate(s.savedAt)}</span>
                        </div>
                        <div class="file-actions">
                            <select class="file-folder-select" title="Déplacer vers un dossier">${folderOptions(s.folder)}</select>
                            <button type="button" class="icon-btn" data-action="open" title="Ouvrir" aria-label="Ouvrir">
                                <svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>
                            </button>
                            <button type="button" class="icon-btn" data-action="rename" title="Renommer" aria-label="Renommer">
                                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                            </button>
                            <button type="button" class="icon-btn" data-action="delete" title="Supprimer" aria-label="Supprimer">
                                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                            </button>
                        </div>
                    </div>`).join('')}
            </details>`).join('');

        host.querySelectorAll('.file-row').forEach(row => {
            const id = row.dataset.id;
            row.querySelector('[data-action="open"]').onclick = () => this.openSongFromFiles(id);
            row.querySelector('[data-action="rename"]').onclick = () => this.startInlineRenameSong(id);
            row.querySelector('[data-action="delete"]').onclick = () => this.deleteSongById(id);
            row.querySelector('.file-folder-select').onchange = (e) => {
                if (e.target.value === '__new__') this.startInlineNewFolderForSong(id, e.target);
                else this.moveSongToFolder(id, e.target.value || null);
            };
            this.attachContextMenuTrigger(row, () => ({ type: 'song', id }));
        });

        host.querySelectorAll('[data-folder-action="rename"]').forEach(btn => {
            btn.onclick = () => this.startInlineRenameFolder(btn.dataset.folder);
        });
        host.querySelectorAll('[data-folder-action="delete"]').forEach(btn => {
            btn.onclick = () => this.deleteFolder(btn.dataset.folder);
        });
        host.querySelectorAll('.file-group').forEach(group => {
            const nameEl = group.querySelector('.file-group-name');
            const folderName = nameEl && nameEl.dataset.folder;
            if (folderName) {
                this.attachContextMenuTrigger(group.querySelector('summary'), () => ({ type: 'folder', name: folderName }));
            }
        });

        this.wireFilesToolbar();
    }

    wireFilesToolbar() {
        const newBtn = document.getElementById('new-folder-btn');
        if (newBtn) newBtn.onclick = () => this.startInlineCreateFolder();
        const exportBtn = document.getElementById('library-export-btn');
        if (exportBtn) exportBtn.onclick = () => this.exportLibrary();
        const importBtn = document.getElementById('library-import-btn');
        const importInput = document.getElementById('library-import-input');
        if (importBtn && importInput) {
            importBtn.onclick = () => importInput.click();
            importInput.onchange = () => {
                const file = importInput.files[0];
                importInput.value = ''; // permet de resélectionner le même fichier ensuite
                if (file) this.importLibraryFile(file);
            };
        }
    }

    openSongFromFiles(id) {
        if (id === (getCurrentSongId() || '')) { this.closeSettings(); return; }
        if (!this.confirmDiscardUnsavedIfNeeded()) return;
        this.loadSong(id);
        this.closeSettings();
    }

    // Édition en ligne du nom d'un morceau (au lieu d'un prompt() natif) : le texte devient un champ
    // éditable directement dans la liste, Entrée/perte de focus valide, Échap annule.
    startInlineRenameSong(id) {
        const nameEl = document.querySelector(`.file-row[data-id="${CSS.escape(id)}"] .file-name`);
        if (!nameEl || nameEl.querySelector('input')) return; // déjà en cours d'édition
        const songs = loadSongs();
        const song = songs.find(s => s.id === id);
        if (!song) return;

        nameEl.innerHTML = `<input type="text" class="inline-rename-input" value="${escapeHtml(song.name)}">`;
        const input = nameEl.querySelector('input');
        input.focus();
        input.select();

        const commit = () => {
            const val = input.value.trim();
            if (val && val !== song.name) {
                this.pushFilesUndo();
                song.name = val;
                saveSongs(songs);
                this.refreshSongList();
            }
            this.renderFilesPanel();
        };
        input.addEventListener('blur', commit);
        input.addEventListener('keydown', (e) => {
            e.stopPropagation(); // ne remonte pas vers les raccourcis clavier globaux (Ctrl+Z, Échap...)
            if (e.key === 'Enter') { e.preventDefault(); input.blur(); }
            else if (e.key === 'Escape') { e.preventDefault(); input.removeEventListener('blur', commit); this.renderFilesPanel(); }
        });
    }

    deleteSongById(id) {
        const songs = loadSongs();
        const song = songs.find(s => s.id === id);
        if (!song) return;
        if (!confirm(`Supprimer « ${song.name} » ? (Ctrl+Z pour annuler juste après si besoin)`)) return;
        this.pushFilesUndo();
        saveSongs(songs.filter(s => s.id !== id));
        if (getCurrentSongId() === id) setCurrentSongId(null);
        this.refreshSongList();
        if (this.settingsOpen) this.renderFilesPanel();
    }

    moveSongToFolder(id, folder) {
        const songs = loadSongs();
        const song = songs.find(s => s.id === id);
        if (!song) return;
        this.pushFilesUndo();
        song.folder = folder || null;
        saveSongs(songs);
        if (folder) {
            const folders = loadFolders();
            if (!folders.includes(folder)) { folders.push(folder); saveFolders(folders); }
        }
        this.renderFilesPanel();
    }

    // Choix de « + Nouveau dossier… » dans le select d'un morceau : le select se change lui-même
    // en champ de saisie, plutôt qu'un prompt() natif.
    startInlineNewFolderForSong(id, selectEl) {
        selectEl.outerHTML = `<input type="text" class="inline-rename-input file-folder-select" placeholder="Nom du dossier…">`;
        const row = document.querySelector(`.file-row[data-id="${CSS.escape(id)}"]`);
        const input = row.querySelector('.file-folder-select');
        input.focus();

        const commit = () => {
            const trimmed = input.value.trim();
            if (trimmed) this.moveSongToFolder(id, trimmed);
            else this.renderFilesPanel();
        };
        input.addEventListener('blur', commit);
        input.addEventListener('keydown', (e) => {
            e.stopPropagation();
            if (e.key === 'Enter') { e.preventDefault(); input.blur(); }
            else if (e.key === 'Escape') { e.preventDefault(); input.removeEventListener('blur', commit); this.renderFilesPanel(); }
        });
    }

    // Crée un dossier vide (visible même sans aucun morceau dedans, jusqu'à ce qu'on y en glisse un) —
    // le bouton « Nouveau dossier » se change lui-même en champ de saisie, plutôt qu'un prompt() natif.
    startInlineCreateFolder() {
        const btn = document.getElementById('new-folder-btn');
        if (!btn) return;
        btn.outerHTML = `<span class="new-folder-inline"><input type="text" class="inline-rename-input" id="new-folder-input" placeholder="Nom du dossier…"></span>`;
        const input = document.getElementById('new-folder-input');
        input.focus();

        const commit = () => {
            const trimmed = input.value.trim();
            if (trimmed) {
                const folders = loadFolders();
                if (folders.includes(trimmed)) { this.flashHint(`Le dossier « ${trimmed} » existe déjà`); this.renderFilesPanel(); return; }
                this.pushFilesUndo();
                folders.push(trimmed);
                saveFolders(folders);
            }
            this.renderFilesPanel();
        };
        input.addEventListener('blur', commit);
        input.addEventListener('keydown', (e) => {
            e.stopPropagation();
            if (e.key === 'Enter') { e.preventDefault(); input.blur(); }
            else if (e.key === 'Escape') { e.preventDefault(); input.removeEventListener('blur', commit); this.renderFilesPanel(); }
        });
    }

    // Édition en ligne du nom d'un dossier (au lieu d'un prompt() natif) : met à jour le registre ET
    // tous les morceaux qui s'y trouvent.
    startInlineRenameFolder(oldName) {
        const nameEl = document.querySelector(`.file-group-name[data-folder="${CSS.escape(oldName)}"]`);
        if (!nameEl || nameEl.querySelector('input')) return;

        nameEl.innerHTML = `<input type="text" class="inline-rename-input" value="${escapeHtml(oldName)}" onclick="event.stopPropagation()">`;
        const input = nameEl.querySelector('input');
        input.focus();
        input.select();

        const commit = () => {
            const trimmed = input.value.trim();
            if (trimmed && trimmed !== oldName) {
                const folders = loadFolders();
                if (folders.includes(trimmed)) { this.flashHint(`Le dossier « ${trimmed} » existe déjà`); this.renderFilesPanel(); return; }
                this.pushFilesUndo();
                const idx = folders.indexOf(oldName);
                if (idx >= 0) folders[idx] = trimmed; else folders.push(trimmed);
                saveFolders(folders);
                const songs = loadSongs();
                songs.forEach(s => { if (s.folder === oldName) s.folder = trimmed; });
                saveSongs(songs);
            }
            this.renderFilesPanel();
        };
        input.addEventListener('blur', commit);
        input.addEventListener('keydown', (e) => {
            e.stopPropagation();
            if (e.key === 'Enter') { e.preventDefault(); input.blur(); }
            else if (e.key === 'Escape') { e.preventDefault(); input.removeEventListener('blur', commit); this.renderFilesPanel(); }
        });
    }

    // Supprime un dossier (confirmation demandée) : les morceaux qu'il contenait repassent
    // « Sans dossier » — ils ne sont jamais supprimés eux-mêmes.
    deleteFolder(name) {
        const songs = loadSongs();
        const count = songs.filter(s => s.folder === name).length;
        const msg = count > 0
            ? `Supprimer le dossier « ${name} » ? ${count} morceau(x) repasseront en « Sans dossier ». (Ctrl+Z pour annuler juste après si besoin)`
            : `Supprimer le dossier « ${name} » ? (Ctrl+Z pour annuler juste après si besoin)`;
        if (!confirm(msg)) return;
        this.pushFilesUndo();
        saveFolders(loadFolders().filter(f => f !== name));
        songs.forEach(s => { if (s.folder === name) s.folder = null; });
        saveSongs(songs);
        this.renderFilesPanel();
    }

    // ---------- Sauvegarde/restauration de toute la bibliothèque (fichier .json) ----------
    // Ne couvre QUE la bibliothèque (morceaux + dossiers) : les préférences locales de l'appareil
    // (volumes, instrument par défaut, son du métronome...) n'ont pas leur place dans une sauvegarde
    // destinée à être restaurée sur un autre navigateur ou ordinateur.
    exportLibrary() {
        const payload = {
            app: 'HarmoHub',
            kind: 'library-backup',
            version: 1,
            exportedAt: Date.now(),
            songs: loadSongs(),
            folders: loadFolders()
        };
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `harmohub-bibliotheque-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        this.flashHint('Bibliothèque exportée');
    }

    // Importe une sauvegarde : AJOUTE les morceaux du fichier à la bibliothèque actuelle, sans jamais
    // rien supprimer ni écraser (une restauration ne doit jamais faire perdre du travail en cours).
    // Les morceaux dont l'identifiant existe déjà (déjà importés, ou fichier réimporté par erreur)
    // sont ignorés silencieusement plutôt que dupliqués — importer deux fois le même fichier ne
    // change donc rien la seconde fois.
    async importLibraryFile(file) {
        let data;
        try {
            data = JSON.parse(await file.text());
        } catch (e) {
            data = null;
        }
        if (!data || !Array.isArray(data.songs)) {
            this.flashHint('Fichier invalide — ce n\'est pas une sauvegarde HarmoHub');
            return;
        }

        const existingSongs = loadSongs();
        const existingIds = new Set(existingSongs.map(s => s.id));
        const toAdd = data.songs.filter(s => s && s.id && !existingIds.has(s.id));
        const skipped = data.songs.length - toAdd.length;

        const existingFolders = loadFolders();
        const mergedFolders = Array.isArray(data.folders) ? [...new Set([...existingFolders, ...data.folders])] : existingFolders;
        const foldersChanged = mergedFolders.length !== existingFolders.length;

        if (toAdd.length > 0 || foldersChanged) {
            this.pushFilesUndo(); // un seul pas d'annulation pour tout l'import (morceaux + dossiers)
            if (toAdd.length > 0) saveSongs([...existingSongs, ...toAdd]);
            if (foldersChanged) saveFolders(mergedFolders);
            this.refreshSongList();
            if (this.settingsOpen) this.renderFilesPanel();
        }

        if (toAdd.length === 0) {
            this.flashHint(skipped > 0 ? 'Bibliothèque déjà à jour — rien à importer' : 'Aucun morceau dans ce fichier');
        } else if (skipped > 0) {
            this.flashHint(`${toAdd.length} morceau(x) importé(s), ${skipped} déjà présent(s)`);
        } else {
            this.flashHint(`${toAdd.length} morceau(x) importé(s)`);
        }
    }

    // ---------- Menu contextuel (clic droit / appui long) ----------
    // Utilisé pour les morceaux et les dossiers de la fenêtre Fichiers : « Renommer » déclenche la
    // même édition en ligne que les boutons ✎ ; « Supprimer » déclenche la même action que 🗑.
    attachContextMenuTrigger(el, targetFn) {
        el.addEventListener('contextmenu', (e) => {
            if (el.querySelector('.cell-sym-input')) return; // édition inline en cours, voir plus bas
            e.preventDefault();
            this.openContextMenu(e.clientX, e.clientY, targetFn());
        });

        let pressTimer = null, startX = 0, startY = 0, longPressed = false;
        el.addEventListener('touchstart', (e) => {
            if (e.touches.length !== 1) return;
            // Édition inline du symbole en cours sur CETTE case (voir startInlineChordSymbolEdit) :
            // elle remplace juste le texte affiché par un <input>, la case elle-même (et donc ce
            // long-press) reste montée tout du long. Sans ce garde-fou, un appui un peu long sur le
            // champ pendant qu'on tape (ou pour repositionner le curseur) rouvrait le menu contextuel
            // PAR-DESSUS le clavier/champ actif, bloquant la saisie — vu sur téléphone.
            if (el.querySelector('.cell-sym-input')) return;
            longPressed = false;
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            pressTimer = setTimeout(() => {
                longPressed = true;
                this.openContextMenu(startX, startY, targetFn());
            }, 550);
        }, { passive: true });
        el.addEventListener('touchmove', (e) => {
            if (!pressTimer) return;
            const dx = e.touches[0].clientX - startX, dy = e.touches[0].clientY - startY;
            if (Math.hypot(dx, dy) > 10) { clearTimeout(pressTimer); pressTimer = null; }
        }, { passive: true });
        el.addEventListener('touchend', (e) => {
            if (pressTimer) { clearTimeout(pressTimer); pressTimer = null; }
            if (longPressed) e.preventDefault(); // évite qu'un clic/toggle ne suive juste après le menu
        });
    }

    openContextMenu(x, y, target) {
        // Un appui long sur une case de la grille ouvre ce menu AVANT le relâchement du doigt : le
        // glisser/tap de la grille (this.drag, voir onGridPointerDown) est encore armé sur ce même
        // geste. Plutôt que l'annuler complètement (ce qui empêcherait tout glisser ENSUITE), on le
        // laisse vivant avec un simple repère (menuShown) : si le doigt bouge avant le relâchement,
        // onGridPointerMove referme ce menu et reprend le geste comme un glisser-copie (l'appui était
        // déjà assez long) ; s'il se relâche SANS bouger, onGridPointerUp ne fait rien de plus (pas de
        // tap-sélection ni de double-tap), le menu reste normalement affiché.
        if (this.drag) this.drag.menuShown = true;

        this.contextMenuTarget = target;
        const menu = document.getElementById('context-menu');
        // Libellé et actions disponibles diffèrent selon le type de cible (morceau/dossier : Renommer
        // + Supprimer ; accord : Modifier + Dupliquer + Séquenceur + Supprimer).
        const isChord = target && target.type === 'chord';
        menu.querySelector('[data-ctx-action="rename"] .ctx-label').textContent = isChord ? 'Modifier' : 'Renommer';
        menu.querySelector('[data-ctx-action="duplicate"]').hidden = !isChord;
        menu.querySelector('[data-ctx-action="octave-up"]').hidden = !isChord;
        menu.querySelector('[data-ctx-action="octave-down"]').hidden = !isChord;
        menu.querySelector('[data-ctx-action="sequencer"]').hidden = !isChord;
        menu.hidden = false;
        const pad = 8;
        const left = Math.min(x, window.innerWidth - menu.offsetWidth - pad);
        const top = Math.min(y, window.innerHeight - menu.offsetHeight - pad);
        menu.style.left = `${Math.max(pad, left)}px`;
        menu.style.top = `${Math.max(pad, top)}px`;
    }

    closeContextMenu() {
        const menu = document.getElementById('context-menu');
        if (menu) menu.hidden = true;
        this.contextMenuTarget = null;
    }

    // ---------- Annuler / Rétablir dans la fenêtre Fichiers ----------
    // Historique dédié, séparé des deux autres : un instantané combiné {folders, songs} avant chaque
    // action (créer/renommer/supprimer un dossier, renommer/supprimer/déplacer un morceau).
    pushFilesUndo() {
        this.filesUndoStack.push(JSON.stringify({ folders: loadFolders(), songs: loadSongs() }));
        if (this.filesUndoStack.length > this.undoLimit) this.filesUndoStack.shift();
        this.filesRedoStack = [];
        this.updateGlobalUndoRedoButtons();
    }

    filesUndo() {
        if (this.filesUndoStack.length === 0) { this.flashHint('Rien à annuler dans les fichiers'); return; }
        this.filesRedoStack.push(JSON.stringify({ folders: loadFolders(), songs: loadSongs() }));
        const prev = JSON.parse(this.filesUndoStack.pop());
        saveFolders(prev.folders);
        saveSongs(prev.songs);
        this.refreshSongList();
        if (this.settingsOpen) this.renderFilesPanel();
        this.updateGlobalUndoRedoButtons();
        this.flashHint('Annulé');
    }

    filesRedo() {
        if (this.filesRedoStack.length === 0) { this.flashHint('Rien à rétablir dans les fichiers'); return; }
        this.filesUndoStack.push(JSON.stringify({ folders: loadFolders(), songs: loadSongs() }));
        const next = JSON.parse(this.filesRedoStack.pop());
        saveFolders(next.folders);
        saveSongs(next.songs);
        this.refreshSongList();
        if (this.settingsOpen) this.renderFilesPanel();
        this.updateGlobalUndoRedoButtons();
        this.flashHint('Rétabli');
    }


    getCurrentSongName() {
        const id = getCurrentSongId();
        if (!id) return 'Sans titre';
        const song = loadSongs().find(s => s.id === id);
        return song ? song.name : 'Sans titre';
    }

    // ---------- Export PDF (via l'impression du navigateur, sans dépendance externe) ----------

    // Diagramme SVG d'un clavier avec les notes RÉELLEMENT jouées surlignées par fonction
    // (renversement et drop pris en compte, puisqu'on lit directement le voicing calculé)
    buildPianoDiagramSVG(chord) {
        const voiced = chord.getVoiced();
        const midis = voiced.map(v => v.midi);
        const { low, high } = this.computePianoWindow(midis);
        const activeByMidi = {};
        voiced.forEach(v => { activeByMidi[v.midi] = v.role; });

        const BLACK_PCS = [1, 3, 6, 8, 10];
        const KEY_W = 16, KEY_H = 58, BLACK_W = KEY_W * 0.62, BLACK_H = KEY_H * 0.6;

        const whiteMidis = [];
        for (let m = low; m <= high; m++) if (!BLACK_PCS.includes(((m % 12) + 12) % 12)) whiteMidis.push(m);
        const width = whiteMidis.length * KEY_W;

        let svg = `<svg viewBox="0 0 ${width} ${KEY_H}" width="${width}" height="${KEY_H}" xmlns="http://www.w3.org/2000/svg">`;
        whiteMidis.forEach((m, i) => {
            const fill = activeByMidi[m] ? ROLE_COLOR[activeByMidi[m]] : '#ffffff';
            svg += `<rect x="${i * KEY_W}" y="0" width="${KEY_W - 1}" height="${KEY_H}" fill="${fill}" stroke="#888" stroke-width="0.5"/>`;
        });
        let whiteSeen = 0;
        for (let m = low; m <= high; m++) {
            const isBlack = BLACK_PCS.includes(((m % 12) + 12) % 12);
            if (!isBlack) { whiteSeen++; continue; }
            const fill = activeByMidi[m] ? ROLE_COLOR[activeByMidi[m]] : '#1a1a1a';
            const x = whiteSeen * KEY_W - BLACK_W / 2;
            svg += `<rect x="${x}" y="0" width="${BLACK_W}" height="${BLACK_H}" fill="${fill}" stroke="#000" stroke-width="0.5"/>`;
        }
        svg += `</svg>`;
        return svg;
    }

    // Diagramme SVG d'un manche de guitare pour un doigté donné (un élément du tableau retourné par
    // guitarFingeringsForChord/solveGuitarFingerings) : à l'HORIZONTALE, comme un manche de guitare
    // qu'on regarde en le tenant (sillet à gauche, cases vers la droite, corde de Mi AIGU en haut,
    // Mi GRAVE en bas) — convention demandée. Fenêtre d'un nombre de cases FIXE (FRET_WINDOW) pour que
    // tous les diagrammes aient la même taille, avec les repères habituels du manche (points
    // d'incrustation aux cases 3, 5, 7, 9, 15, 17..., double point à la 12) quand ils sont dans la
    // fenêtre affichée. `forPrint` bascule vers des couleurs sombres (encre sur papier blanc) au lieu
    // des couleurs claires utilisées en direct sur fond sombre.
    buildGuitarDiagramSVG(byString, forPrint = false) {
        const FRET_WINDOW = 5; // nombre de cases visibles, identique pour tous les accords
        const SINGLE_MARKERS = [3, 5, 7, 9, 15, 17, 19, 21];
        const DOUBLE_MARKERS = [12, 24];
        const STRING_GAP = 16, FRET_GAP = 30, MARGIN_LEFT = 20, MARGIN_TOP = 8, LABEL_ROW_H = 13;
        const lineColor = forPrint ? '#555' : '#888';
        const nutColor = forPrint ? '#1a1a1a' : '#e8e8e8';
        const openColor = forPrint ? '#333' : '#ccc';
        const markerColor = forPrint ? '#999' : '#3a3a3a';
        const labelColor = forPrint ? '#333' : '#999';

        // Corde aiguë (Mi aigu, index 5) en haut, grave (Mi grave, index 0) en bas : y croît avec
        // l'index de corde à l'envers.
        const stringY = s => MARGIN_TOP + (5 - s) * STRING_GAP;

        const fretted = byString.filter(e => e && e.fret > 0);
        const maxFret = fretted.length ? Math.max(...fretted.map(e => e.fret)) : 0;
        const minFret = fretted.length ? Math.min(...fretted.map(e => e.fret)) : 0;
        // Le sillet ne s'affiche que s'il y a une vraie corde à vide ET que le reste de la forme
        // tient dans la fenêtre depuis la case 0 : un barré à la case 1 (ex. Fa, forme E) n'a AUCUNE
        // corde ouverte et doit afficher un repère de position ("1") plutôt qu'un sillet, sinon on le
        // confondrait avec un accord en position ouverte ; et une corde à vide isolée alors que le
        // reste de l'accord est loin sur le manche ne doit pas forcer la fenêtre à revenir à la case 0
        // (les notes réellement jouées deviendraient invisibles, hors fenêtre).
        const hasOpenString = byString.some(e => e && e.fret === 0);
        const showNut = fretted.length === 0 || (hasOpenString && maxFret <= FRET_WINDOW);
        const baseFret = showNut ? 0 : (minFret - 1); // n° de case juste avant la 1ère colonne dessinée

        const stringsSpan = STRING_GAP * 5;
        const width = MARGIN_LEFT + FRET_GAP * FRET_WINDOW + 8;
        const height = MARGIN_TOP + stringsSpan + LABEL_ROW_H + 4;

        let svg = `<svg viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;

        // Dégradés des points de doigté (voir ROLE_GRADIENT_STOPS) : uniquement en direct, jamais à
        // l'impression (encre en aplat, plus fiable sur papier). uid distingue les <radialGradient>
        // de ce schéma de ceux d'un autre schéma affiché en même temps ailleurs dans la page (ids
        // HTML censés être uniques document-wide).
        const uid = forPrint ? null : ++guitarSvgIdSeq;
        if (!forPrint) {
            // N'émettre que les dégradés des rôles réellement présents dans ce doigté (au plus 5,
            // souvent 2-3) plutôt que les 5 systématiquement : évite du SVG mort dans chaque diagramme.
            const usedRoles = new Set(fretted.map(e => ROLE_GRADIENT_STOPS[e.role] ? e.role : 'ext'));
            svg += '<defs>';
            usedRoles.forEach(role => {
                const [light, mid, dark] = ROLE_GRADIENT_STOPS[role];
                svg += `<radialGradient id="gdot-${role}-${uid}" cx="32%" cy="28%" r="75%">` +
                    `<stop offset="0%" stop-color="${light}"/>` +
                    `<stop offset="55%" stop-color="${mid}"/>` +
                    `<stop offset="100%" stop-color="${dark}"/>` +
                    `</radialGradient>`;
            });
            svg += '</defs>';
        }

        if (showNut) {
            svg += `<rect x="${MARGIN_LEFT - 2}" y="${MARGIN_TOP}" width="3" height="${stringsSpan}" fill="${nutColor}"/>`;
        } else {
            svg += `<line x1="${MARGIN_LEFT}" y1="${MARGIN_TOP}" x2="${MARGIN_LEFT}" y2="${MARGIN_TOP + stringsSpan}" stroke="${lineColor}" stroke-width="1"/>`;
        }
        for (let c = 1; c <= FRET_WINDOW; c++) {
            const x = MARGIN_LEFT + c * FRET_GAP;
            svg += `<line x1="${x}" y1="${MARGIN_TOP}" x2="${x}" y2="${MARGIN_TOP + stringsSpan}" stroke="${lineColor}" stroke-width="1"/>`;
        }
        for (let s = 0; s < 6; s++) {
            const y = stringY(s);
            svg += `<line x1="${MARGIN_LEFT}" y1="${y}" x2="${MARGIN_LEFT + FRET_GAP * FRET_WINDOW}" y2="${y}" stroke="${lineColor}" stroke-width="1"/>`;
        }
        // Barré (un seul doigt à plat sur plusieurs cordes à la même case) : fond semi-transparent sur
        // toute la largeur de la case, entre les deux cordes extrêmes couvertes — matérialise qu'il
        // faut appuyer avec TOUT le doigt à plat à cet endroit, pas juste du bout du doigt comme les
        // autres cases. Sous les repères/points de doigté dessinés ensuite (ordre du document SVG).
        const barre = detectBarre(byString);
        if (barre && barre.fret - baseFret >= 1 && barre.fret - baseFret <= FRET_WINDOW) {
            const col = barre.fret - baseFret;
            const barreInset = 4; // légèrement moins large que la case de la frette, pour ne pas la toucher
            const bx = MARGIN_LEFT + (col - 1) * FRET_GAP + barreInset;
            const byTop = stringY(barre.hiString) - STRING_GAP * 0.42;
            const byBottom = stringY(barre.loString) + STRING_GAP * 0.42;
            const barreFill = forPrint ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.14)';
            const barreStroke = forPrint ? 'rgba(0, 0, 0, 0.25)' : 'rgba(255, 255, 255, 0.3)';
            svg += `<rect x="${bx}" y="${byTop}" width="${FRET_GAP - barreInset * 2}" height="${byBottom - byTop}" rx="6" fill="${barreFill}" stroke="${barreStroke}" stroke-width="1"/>`;
        }
        // Points de repère du manche (incrustations réelles d'une guitare), centrés dans la hauteur du
        // diagramme — un seul point pour les cases usuelles, deux pour l'octave (case 12/24) — avec le
        // numéro de case en dessous du manche, UNIQUEMENT là où il y a un point (pas de repère générique
        // de position, moins lisible et redondant).
        const midY = MARGIN_TOP + stringsSpan / 2;
        const labelY = MARGIN_TOP + stringsSpan + 11;
        SINGLE_MARKERS.forEach(marker => {
            if (marker < baseFret + 1 || marker > baseFret + FRET_WINDOW) return;
            const x = MARGIN_LEFT + (marker - baseFret - 0.5) * FRET_GAP;
            svg += `<circle cx="${x}" cy="${midY}" r="3" fill="${markerColor}"/>`;
            svg += `<text x="${x}" y="${labelY}" font-size="8" fill="${labelColor}" text-anchor="middle">${marker}</text>`;
        });
        DOUBLE_MARKERS.forEach(marker => {
            if (marker < baseFret + 1 || marker > baseFret + FRET_WINDOW) return;
            const x = MARGIN_LEFT + (marker - baseFret - 0.5) * FRET_GAP;
            svg += `<circle cx="${x}" cy="${midY - STRING_GAP}" r="3" fill="${markerColor}"/>`;
            svg += `<circle cx="${x}" cy="${midY + STRING_GAP}" r="3" fill="${markerColor}"/>`;
            svg += `<text x="${x}" y="${labelY}" font-size="8" fill="${labelColor}" text-anchor="middle">${marker}</text>`;
        });
        byString.forEach((e, s) => {
            const y = stringY(s) + 3;
            if (!e) svg += `<text x="${MARGIN_LEFT - 9}" y="${y}" font-size="9" fill="#e53922" text-anchor="middle">X</text>`;
            else if (e.fret === 0) svg += `<text x="${MARGIN_LEFT - 9}" y="${y}" font-size="9" fill="${openColor}" text-anchor="middle">O</text>`;
        });
        byString.forEach((e, s) => {
            if (!e || e.fret === 0) return;
            const col = e.fret - baseFret;
            const x = MARGIN_LEFT + (col - 0.5) * FRET_GAP;
            const y = stringY(s);
            const role = ROLE_GRADIENT_STOPS[e.role] ? e.role : 'ext';
            const fill = forPrint ? (ROLE_COLOR[role] || ROLE_COLOR.ext) : `url(#gdot-${role}-${uid})`;
            svg += `<circle cx="${x}" cy="${y}" r="6" fill="${fill}" stroke="#000" stroke-width="0.5"/>`;
        });
        svg += `</svg>`;
        return svg;
    }

    // Construit le HTML des deux pages imprimées : page 1 = grille d'accords, page 2 = voicings piano
    buildPrintExportHtml() {
        const sections = loadProgressionSections();
        const gRoot = document.getElementById('global-root').value;
        const gMode = document.getElementById('global-mode').value;
        const useFlats = useFlatsForKey(NOTES.indexOf(gRoot), gMode);
        const bpm = document.getElementById('bpm').value;
        const timeSig = document.getElementById('time-sig').value;
        const songName = this.getCurrentSongName();

        let page1 = `<div class="print-page">
            <h1 class="print-title">${escapeHtml(songName)}</h1>
            <div class="print-meta">Tonalité : ${noteNameForPc(NOTES.indexOf(gRoot), useFlats)} ${MODE_LABELS[gMode] || 'majeur'} · ${timeSig} · ${bpm} BPM</div>`;

        // Même découpage en lignes/mesures que la grille à l'écran (layoutProgression) : chaque ligne
        // imprimée correspond ainsi à un nombre entier de mesures, avec leur numéro, plutôt qu'un
        // simple retour à la ligne au gré de la largeur (comme c'était le cas avant).
        const beatsPerBar = this.beatsPerBar();
        const allChords = []; // à plat, dans l'ordre de lecture, pour la page 2
        sections.forEach((sec, si) => {
            const title = (sec.title && sec.title.trim()) ? sec.title : `Partie ${si + 1}`;
            const measuresSuffix = sec.chords.length > 0 ? ` <span class="print-section-measures">— ${sectionMeasureCount(sec, beatsPerBar)} mesures</span>` : '';
            page1 += `<h2 class="print-section-title">${escapeHtml(title)}${measuresSuffix}</h2>`;
            if (!sec.chords.length) {
                page1 += `<div class="print-empty">—</div>`;
                return;
            }
            const { cells, rows } = this.layoutProgression(sec.chords, beatsPerBar);
            for (let r = 0; r < rows; r++) {
                page1 += `<div class="print-chord-row">`;
                cells.filter(c => c.row === r).forEach(s => {
                    const data = sec.chords[s.index];
                    const chord = new Chord(data.root, data.quality, beatsFromData(data), data.inversion, data.drop, octaveFromData(data), data.bass);
                    const chordUseFlats = useFlatsForChordRoot(NOTES.indexOf(data.root), NOTES.indexOf(gRoot), gMode, useFlats);
                    const sym = chord.getLabel(chordUseFlats) + ((s.split && !s.isFirst) ? ' ↩' : '');
                    const roman = s.isFirst ? this.getRomanNumeral(gRoot, gMode, data.root, data.quality) : '';
                    const measureEl = s.barStart ? `<span class="print-chord-measure">${s.barNumber}</span>` : '';
                    page1 += `<div class="print-chord-cell" style="flex-grow:${s.span};">
                        ${measureEl}
                        <span class="print-chord-roman">${roman}</span>
                        <span class="print-chord-sym">${escapeHtml(sym)}</span>
                    </div>`;
                    if (s.isFirst) allChords.push({ chord, sym });
                });
                page1 += `</div>`;
            }
        });
        page1 += `</div>`;

        // Page 2 : un schéma par voicing DISTINCT seulement (même fondamentale/qualité/renversement/
        // drop/octave -> même disposition de touches), même si l'accord revient plusieurs fois dans
        // le morceau — inutile de répéter le même schéma de piano.
        const seenVoicings = new Set();
        const uniqueChords = allChords.filter(({ chord }) => {
            const key = chord.getVoiced().map(v => `${v.midi}:${v.role}`).join(',');
            if (seenVoicings.has(key)) return false;
            seenVoicings.add(key);
            return true;
        });

        // Piano et/ou guitare selon les bascules de la vue live (aucune page 2 si les deux sont masquées)
        const showPiano = this.showPianoViz(), showGuitar = this.showGuitarViz();
        let page2 = '';
        if (showPiano || showGuitar) {
            page2 = `<div class="print-page"><h1 class="print-title">Voicings</h1><div class="print-piano-grid">`;
            uniqueChords.forEach(({ chord, sym }) => {
                const diagrams = [];
                if (showPiano) diagrams.push(this.buildPianoDiagramSVG(chord));
                if (showGuitar) {
                    const fingerings = guitarFingeringsForChord(chord);
                    diagrams.push(fingerings.length
                        ? this.buildGuitarDiagramSVG(fingerings[0], true)
                        : `<div class="print-guitar-unplayable">Non jouable<br>à la guitare</div>`);
                }
                page2 += `<div class="print-piano-item">
                    <div class="print-piano-label">${escapeHtml(sym)}</div>
                    <div class="print-diagrams">${diagrams.join('')}</div>
                </div>`;
            });
            page2 += `</div></div>`;
        }

        return page1 + page2;
    }

    // Bouton "📄" en bas à droite du piano : passe par l'impression du navigateur (choisir
    // "Enregistrer en PDF" comme destination) — pas de dépendance externe à charger.
    exportPdf() {
        // Le morceau doit être enregistré (avec un nom) pour pouvoir nommer le PDF en conséquence
        if (!getCurrentSongId()) {
            this.saveCurrentAsSong();
            if (!getCurrentSongId()) return; // enregistrement annulé -> pas d'export
        }

        const host = document.getElementById('print-export');
        if (!host) return;
        host.innerHTML = this.buildPrintExportHtml();

        // Le titre du document sert de nom de fichier suggéré par la boîte de dialogue d'impression
        const prevTitle = document.title;
        document.title = `${this.getCurrentSongName()} - grille d'accords`;
        const restoreTitle = () => { document.title = prevTitle; window.removeEventListener('afterprint', restoreTitle); };
        window.addEventListener('afterprint', restoreTitle);

        window.print();
    }

    // ---------- Export MIDI (fichier .mid standard, une piste par instrument utilisé) ----------
    // Reprend le même motif de séquenceur que la lecture (resolveSeqPatternForData, la même logique
    // de regroupement des croches liées en une note tenue que schedulePlayback) : ce qu'on entend
    // dans l'appli est ce qui se retrouve dans le fichier, sans le décompte ni le métronome (propres
    // à l'écoute in-app, pas au morceau lui-même).
    buildMidiFile() {
        const bpm = parseInt(document.getElementById('bpm').value) || 120;
        const [numerator, denominator] = (document.getElementById('time-sig').value || '4/4').split('/').map(Number);
        const ticksPerStep = MIDI_PPQ / SEQ_STEPS_PER_BEAT;
        const grooveRatio = this.grooveRatio(); // voir GROOVE_RATIOS/grooveStepOffset

        const meta = new MidiTrackBuilder();
        meta.push(0, midiTextEvent(0x03, this.getCurrentSongName()));
        meta.push(0, midiTempoEvent(bpm));
        meta.push(0, midiTimeSigEvent(numerator, denominator));

        // Une piste par instrument utilisé (créée à la demande, sur son propre canal) : dans le DAW,
        // chaque son reste isolé sur sa piste et peut être remplacé indépendamment des autres.
        const tracks = new Map(); // clé instrument -> { builder, channel }
        let nextChannel = 0;
        const trackFor = (key) => {
            if (!GM_PROGRAM[key]) key = 'piano';
            if (!tracks.has(key)) {
                if (nextChannel === 9) nextChannel++; // canal 9 (GM) réservé à la percussion : sauté
                const channel = nextChannel++;
                const builder = new MidiTrackBuilder();
                builder.push(0, midiTextEvent(0x03, INSTRUMENT_BANKS[key].label));
                builder.push(0, [0xc0 | channel, GM_PROGRAM[key]]);
                tracks.set(key, { builder, channel });
            }
            return tracks.get(key);
        };

        let tick = 0;
        loadProgressionSections().forEach(sec => {
            if (sec.title && sec.title.trim()) meta.push(tick, midiTextEvent(0x06, sec.title.trim()));
            sec.chords.forEach(data => {
                const beats = beatsFromData(data);
                const chord = new Chord(data.root, data.quality, beats, data.inversion, data.drop, octaveFromData(data), data.bass);
                const midis = chord.getSeqMidiNotes();
                const { pattern, tie } = this.resolveSeqPatternForData(chord, data);
                const steps = pattern.length;
                const { builder, channel } = trackFor(data.instrument || 'piano');

                // Une voix à la fois : regroupe ses croches liées et contiguës en une seule note
                // (même logique que schedulePlayback, voir plus haut), plutôt qu'une attaque par croche.
                for (let voice = 0; voice < midis.length; voice++) {
                    let s = 0;
                    while (s < steps) {
                        if (!pattern[s].includes(voice)) { s++; continue; }
                        const runStart = s;
                        s++;
                        while (s < steps && pattern[s].includes(voice) && tie[s].includes(voice)) s++;
                        const runLen = s - runStart;
                        const held = (runLen === steps);
                        const onBeat = (runStart % SEQ_STEPS_PER_BEAT === 0);
                        const velocity = held ? 100 : (onBeat ? 96 : 84);
                        const startTick = tick + Math.round(grooveStepOffset(runStart, ticksPerStep, grooveRatio));
                        const endTick = tick + Math.round(grooveStepOffset(runStart + runLen, ticksPerStep, grooveRatio));
                        const rawDur = endTick - startTick; // durée réelle de la plage, groove compris
                        // Détache légèrement les notes non tenues (comme à l'écoute), sans jamais
                        // descendre à une durée nulle ni couper un accord tenu sur toute sa durée
                        const durTicks = held ? Math.max(1, rawDur - 8) : Math.max(20, rawDur - Math.round(ticksPerStep * 0.2));
                        const pitch = Math.min(127, Math.max(0, midis[voice]));
                        builder.push(startTick, [0x90 | channel, pitch, velocity]);
                        builder.push(startTick + durTicks, [0x80 | channel, pitch, 0]);
                    }
                }
                tick += beats * MIDI_PPQ;
            });
        });

        const trackList = [meta, ...Array.from(tracks.values()).map(t => t.builder)];
        const chunks = trackList.map(t => t.toBytes(tick)); // `tick` = fin du morceau, voir toBytes()
        const header = [0x4d, 0x54, 0x68, 0x64, ...midiU32(6), ...midiU16(1), ...midiU16(trackList.length), ...midiU16(MIDI_PPQ)];
        const bytes = header.concat(...chunks);
        return new Uint8Array(bytes);
    }

    // Bouton à côté de l'export PDF : télécharge le morceau entier en .mid, prêt à être importé
    // dans un DAW (GarageBand...) pour en changer les sons ou retravailler le séquenceur.
    exportMidi() {
        if (!getCurrentSongId()) {
            this.saveCurrentAsSong();
            if (!getCurrentSongId()) return; // enregistrement annulé -> pas d'export
        }
        const bytes = this.buildMidiFile();
        const blob = new Blob([bytes], { type: 'audio/midi' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.getCurrentSongName().replace(/[\\/:*?"<>|]+/g, '_')}.mid`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    }

    // ---------- Export audio (.mp3, encodage LAME embarqué — voir lame.min.js) ----------
    // Reprend la même résolution de motif que l'export MIDI (resolveSeqPatternForData) et le même
    // regroupement des croches liées en une seule note tenue : ce qu'on entend dans l'appli est ce qui
    // se retrouve dans le fichier, sans le décompte ni le métronome (comme pour l'export MIDI).
    //
    // Rendu hors-temps réel (Tone.Offline) avec des instruments dédiés à ce rendu, connectés
    // directement à la sortie du contexte hors-ligne — jamais ceux du cache de lecture live
    // (this.instrumentCache), qui restent liés au contexte audio temps réel et ne peuvent pas se
    // connecter à un contexte hors-ligne. On ne passe PAS non plus par Tone.Transport ici (à la
    // différence de la lecture live et de l'export MIDI) : à l'intérieur d'un rendu Tone.Offline,
    // Tone.Transport.schedule ne déclenche fiablement aucun son avec cette version de Tone.js — chaque
    // note est donc déclenchée directement à son instant absolu (secondes depuis le début du rendu).
    async renderProgressionBuffer() {
        const bpm = parseInt(document.getElementById('bpm').value) || 120;
        const grooveRatio = this.grooveRatio();
        const lead = 0.1, tail = 3; // marge de tête + queue (laisse sonner la release des nappes/synthés)

        const sections = loadProgressionSections();
        let totalBeats = 0;
        sections.forEach(sec => sec.chords.forEach(data => { totalBeats += beatsFromData(data); }));
        if (totalBeats === 0) return null; // grille vide -> rien à rendre

        const secPerBeat = 60 / bpm;
        const duration = lead + totalBeats * secPerBeat + tail;
        const generalVolumePercent = this.generalVolumePercent;

        return Tone.Offline(async () => {
            Tone.Destination.volume.value = percentToDb(generalVolumePercent);
            const instruments = new Map(); // clé instrument -> instance dédiée à ce rendu
            const instrumentFor = (key) => {
                if (!INSTRUMENT_BANKS[key]) key = 'piano';
                if (!instruments.has(key)) instruments.set(key, INSTRUMENT_BANKS[key].build().toDestination());
                return instruments.get(key);
            };

            // Construit d'abord tous les instruments réellement utilisés dans la grille, PUIS attend
            // qu'ils soient prêts avant de déclencher la moindre note. Indispensable pour le Piano
            // (Tone.Sampler) : ses fichiers audio se chargent de façon asynchrone depuis le réseau, et
            // triggerAttackRelease à un instant absolu s'exécute IMMÉDIATEMENT (contrairement à
            // Tone.Transport.schedule, différé) — sans cette attente, les accords joués au Piano
            // restaient silencieux (ou levaient une erreur), le temps que le chargement se termine.
            sections.forEach(sec => sec.chords.forEach(data => instrumentFor(data.instrument || 'piano')));
            await Tone.loaded();

            let timeOffset = lead;
            sections.forEach(sec => {
                sec.chords.forEach(data => {
                    const beats = beatsFromData(data);
                    const chord = new Chord(data.root, data.quality, beats, data.inversion, data.drop, octaveFromData(data), data.bass);
                    const notes = chord.getSeqNotes();
                    const { pattern, tie } = this.resolveSeqPatternForData(chord, data);
                    const steps = pattern.length;
                    const stepDur = secPerBeat / SEQ_STEPS_PER_BEAT;
                    const stepTime = (s) => timeOffset + grooveStepOffset(s, stepDur, grooveRatio);
                    const instrument = instrumentFor(data.instrument || 'piano');

                    // Une voix à la fois : regroupe ses croches liées et contiguës en une seule note
                    // (même logique que schedulePlayback/buildMidiFile), plutôt qu'une attaque par croche.
                    for (let voice = 0; voice < notes.length; voice++) {
                        let s = 0;
                        while (s < steps) {
                            if (!pattern[s].includes(voice)) { s++; continue; }
                            const runStart = s;
                            s++;
                            while (s < steps && pattern[s].includes(voice) && tie[s].includes(voice)) s++;
                            const runLen = s - runStart;
                            const held = (runLen === steps);
                            const onBeat = (runStart % SEQ_STEPS_PER_BEAT === 0);
                            const vel = held ? 1 : (onBeat ? 0.78 + Math.random() * 0.1 : 0.6 + Math.random() * 0.12);
                            const humanize = held ? 0 : Math.random() * 0.02;
                            const t0 = stepTime(runStart);
                            const runDur = stepTime(runStart + runLen) - t0; // durée réelle, groove compris
                            const dur = held ? (runDur - 0.1) : Math.max(0.05, runDur - Math.min(0.06, stepDur * 0.2));
                            instrument.triggerAttackRelease(notes[voice], dur, t0 + humanize, vel);
                        }
                    }
                    timeOffset += beats * secPerBeat;
                });
            });
        }, duration, 2, MP3_SAMPLE_RATE);
    }

    // Encode un AudioBuffer (rendu par Tone.Offline) en MP3 via lamejs (lame.min.js, vendu en local,
    // chargé dans index.html). Découpage par blocs de 1152 échantillons, taille de trame standard MP3.
    audioBufferToMp3(audioBuffer) {
        const left = floatTo16BitPCM(audioBuffer.getChannelData(0));
        const right = audioBuffer.numberOfChannels > 1 ? floatTo16BitPCM(audioBuffer.getChannelData(1)) : left;
        const encoder = new lamejs.Mp3Encoder(2, audioBuffer.sampleRate, 192);
        const blockSize = 1152;
        const chunks = [];
        for (let i = 0; i < left.length; i += blockSize) {
            const mp3buf = encoder.encodeBuffer(left.subarray(i, i + blockSize), right.subarray(i, i + blockSize));
            if (mp3buf.length > 0) chunks.push(mp3buf);
        }
        const end = encoder.flush();
        if (end.length > 0) chunks.push(end);
        return new Blob(chunks, { type: 'audio/mpeg' });
    }

    // Bouton à côté de l'export MIDI : rend le morceau entier hors-temps réel puis l'encode en MP3,
    // prêt à écouter ou partager sans DAW ni lecteur MIDI.
    async exportAudio() {
        if (!getCurrentSongId()) {
            this.saveCurrentAsSong();
            if (!getCurrentSongId()) return; // enregistrement annulé -> pas d'export
        }
        const btn = document.getElementById('export-audio');
        btn.disabled = true;
        this.flashHint('Génération du MP3…', 60000);
        try {
            const toneBuffer = await this.renderProgressionBuffer();
            if (!toneBuffer) { this.flashHint('Grille vide — rien à exporter'); return; }
            const blob = this.audioBufferToMp3(toneBuffer.get());
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${this.getCurrentSongName().replace(/[\\/:*?"<>|]+/g, '_')}.mp3`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
            this.flashHint('MP3 téléchargé');
        } catch (err) {
            console.error(err);
            this.flashHint('Échec de l’export MP3');
        } finally {
            btn.disabled = false;
        }
    }

    // ---------- Durée de l'accord : bouton fermé + menu déroulant d'icônes ----------
    // Pilote le <select id="duration"> resté dans le DOM mais masqué (voir index.html) : il reste la
    // seule source de vérité, lue partout ailleurs (addChordFromSymbol, onResizeStart...) via
    // document.getElementById('duration').value — ce menu ne fait qu'écrire dedans et se resynchroniser
    // avec lui (voir syncDurationPicker, appelée aussi par editChord quand un accord existant se charge).
    setupDurationPicker() {
        const menu = document.getElementById('duration-dd-menu');
        menu.innerHTML = DURATION_OPTIONS.map(d => `
            <button type="button" class="duration-dd-item" data-beats="${d.beats}">
                <svg viewBox="0 0 24 24">${d.svg}</svg>
                <span>${d.name}</span>
            </button>`).join('');

        document.getElementById('duration-dd-toggle').addEventListener('click', (e) => {
            e.stopPropagation();
            if (menu.hidden) this.openDurationMenu(); else this.closeDurationMenu();
        });
        // Ferme au clic ailleurs, comme le menu contextuel de la grille — sauf sur le menu/bouton eux-mêmes.
        document.addEventListener('click', (e) => {
            if (!document.getElementById('duration-dd').contains(e.target)) this.closeDurationMenu();
        });

        menu.addEventListener('click', (e) => {
            const item = e.target.closest('.duration-dd-item');
            if (!item) return;
            const select = document.getElementById('duration');
            select.value = item.dataset.beats;
            select.dispatchEvent(new Event('change', { bubbles: true }));
            this.syncDurationPicker();
            this.closeDurationMenu();
        });

        this.syncDurationPicker();
    }

    openDurationMenu() {
        const toggle = document.getElementById('duration-dd-toggle');
        const menu = document.getElementById('duration-dd-menu');
        menu.hidden = false;
        toggle.setAttribute('aria-expanded', 'true');
        // Position fixed (voir CSS) : coordonnées calculées ici sous le bouton, repliées à gauche si
        // ça déborderait de la fenêtre — même logique que openContextMenu/openSectionPicker.
        const rect = toggle.getBoundingClientRect();
        const pad = 8;
        const left = Math.min(rect.left, window.innerWidth - menu.offsetWidth - pad);
        menu.style.left = `${Math.max(pad, left)}px`;
        menu.style.top = `${Math.min(rect.bottom + 4, window.innerHeight - menu.offsetHeight - pad)}px`;
    }

    closeDurationMenu() {
        const menu = document.getElementById('duration-dd-menu');
        if (menu.hidden) return;
        menu.hidden = true;
        document.getElementById('duration-dd-toggle').setAttribute('aria-expanded', 'false');
    }

    // Reflète la durée actuelle du <select> caché sur le bouton/menu d'icônes — à appeler chaque fois
    // que sa valeur change par un autre chemin que ce menu lui-même (voir editChord).
    syncDurationPicker() {
        const select = document.getElementById('duration');
        const d = DURATION_OPTIONS.find(x => x.beats === select.value) || DURATION_OPTIONS[2];
        document.querySelector('#duration-dd-toggle [data-icon-slot]').innerHTML = `<svg viewBox="0 0 24 24">${d.svg}</svg>`;
        document.querySelector('#duration-dd-toggle [data-label-slot]').textContent = d.label;
        document.querySelectorAll('.duration-dd-item').forEach(b => b.classList.toggle('active', b.dataset.beats === d.beats));
    }

    // ---------- Style de jeu : bouton fermé + menu déroulant d'icônes ----------
    // Même principe que setupDurationPicker ci-dessus (voir son commentaire) : pilote le
    // <select id="playStyle"> resté masqué dans le DOM, seule source de vérité lue ailleurs
    // (onchange du style de jeu, readChord...). Le menu regroupe les options par `group` (Lié/Détaché),
    // avec un intitulé non cliquable entre chaque groupe, comme les <optgroup> d'origine.
    setupPlayStylePicker() {
        const menu = document.getElementById('playstyle-dd-menu');
        let lastGroup;
        menu.innerHTML = PLAYSTYLE_OPTIONS.map(p => {
            const groupHeader = (p.group && p.group !== lastGroup) ? `<div class="playstyle-dd-group">${p.group}</div>` : '';
            lastGroup = p.group;
            return `${groupHeader}
            <button type="button" class="playstyle-dd-item" data-value="${p.value}">
                <svg viewBox="0 0 24 16">${p.svg}</svg>
                <span>${p.name}</span>
            </button>`;
        }).join('');

        document.getElementById('playstyle-dd-toggle').addEventListener('click', (e) => {
            e.stopPropagation();
            if (menu.hidden) this.openPlayStyleMenu(); else this.closePlayStyleMenu();
        });
        document.addEventListener('click', (e) => {
            if (!document.getElementById('playstyle-dd').contains(e.target)) this.closePlayStyleMenu();
        });

        menu.addEventListener('click', (e) => {
            const item = e.target.closest('.playstyle-dd-item');
            if (!item) return;
            const select = document.getElementById('playStyle');
            select.value = item.dataset.value;
            select.dispatchEvent(new Event('change', { bubbles: true }));
            this.syncPlayStylePicker();
            this.closePlayStyleMenu();
        });

        this.syncPlayStylePicker();
    }

    openPlayStyleMenu() {
        const toggle = document.getElementById('playstyle-dd-toggle');
        const menu = document.getElementById('playstyle-dd-menu');
        menu.hidden = false;
        toggle.setAttribute('aria-expanded', 'true');
        const rect = toggle.getBoundingClientRect();
        const pad = 8;
        const left = Math.min(rect.left, window.innerWidth - menu.offsetWidth - pad);
        menu.style.left = `${Math.max(pad, left)}px`;
        menu.style.top = `${Math.min(rect.bottom + 4, window.innerHeight - menu.offsetHeight - pad)}px`;
    }

    closePlayStyleMenu() {
        const menu = document.getElementById('playstyle-dd-menu');
        if (menu.hidden) return;
        menu.hidden = true;
        document.getElementById('playstyle-dd-toggle').setAttribute('aria-expanded', 'false');
    }

    // Reflète le style de jeu actuel du <select> caché sur le bouton/menu d'icônes — à appeler chaque
    // fois que sa valeur change par un autre chemin que ce menu lui-même (voir editChord).
    syncPlayStylePicker() {
        const select = document.getElementById('playStyle');
        const p = PLAYSTYLE_OPTIONS.find(x => x.value === select.value) || PLAYSTYLE_OPTIONS[0];
        document.querySelector('#playstyle-dd-toggle [data-icon-slot]').innerHTML = `<svg viewBox="0 0 24 16">${p.svg}</svg>`;
        document.querySelector('#playstyle-dd-toggle [data-label-slot]').textContent = p.label;
        document.querySelectorAll('.playstyle-dd-item').forEach(b => b.classList.toggle('active', b.dataset.value === select.value));
    }

    // ---------- Grille interactive : tap (écoute), glisser (déplacer) ----------
    // Un seul écouteur délégué sur le conteneur de TOUTES les parties (chaque grille est reconstruite
    // à chaque rendu, contrairement à ce conteneur qui reste stable).
    setupGridInteractions() {
        const host = document.getElementById('progression-sections');
        host.addEventListener('pointerdown', (e) => this.onGridPointerDown(e));
        // Case "+" en bout de grille (voir buildAddCellHtml) : Entrée ajoute l'accord tapé. Échap vide
        // le champ. Sur certains claviers virtuels (mobile), la touche « Entrée »/« Aller » ne déclenche
        // pas toujours un vrai `keydown` détecté ici : on ajoute donc aussi un ajout au relâchement du
        // focus (focusout, ci-dessous) comme filet de sécurité, pour qu'il ne se passe jamais « rien »
        // une fois l'accord tapé, même si on touche simplement ailleurs pour refermer le clavier.
        host.addEventListener('keydown', (e) => {
            if (!e.target.matches('.cell-add-input')) return;
            if (e.key === 'Enter') {
                e.preventDefault();
                // Repris dans le gestionnaire focusout (commun aux deux chemins) : marque qu'on veut
                // enchaîner (redonner le focus) une fois l'ajout fait, contrairement à un simple tap
                // ailleurs pour refermer le clavier (voir plus bas).
                e.target.dataset.refocus = '1';
                e.target.blur();
            } else if (e.key === 'Escape') {
                e.target.value = '';
                e.target.blur();
            }
        });
        // Filet de sécurité : sur certains claviers virtuels (mobile), la touche « Entrée »/« Aller »
        // ne déclenche pas toujours un vrai `keydown` détecté ci-dessus — sans ça, taper un accord puis
        // juste toucher ailleurs pour refermer le clavier ne faisait RIEN. Le relâchement du focus,
        // lui, se produit toujours.
        host.addEventListener('focusout', (e) => {
            if (!e.target.matches('.cell-add-input')) return;
            const value = e.target.value.trim();
            const refocus = e.target.dataset.refocus === '1';
            if (!value) return; // champ vidé (Échap) ou jamais rempli : rien à faire, pas d'erreur inutile
            const section = +e.target.dataset.section;
            if (this.addChordInputToSection(section, value) && refocus) {
                // loadProgression() a déjà reconstruit un champ "+" vide à la même place : lui redonner
                // le focus pour enchaîner plusieurs accords sans re-cliquer à chaque fois — seulement
                // après Entrée (le clavier reste ouvert), jamais après un tap ailleurs qui l'a fermé.
                const fresh = document.querySelector(`.cell-add-input[data-section="${section}"]`);
                if (fresh) fresh.focus();
            }
        });
    }

    onGridPointerDown(e) {
        if (e.button != null && e.button !== 0) return; // clic gauche / touch uniquement
        const gridEl = e.target.closest('.chord-grid');
        if (!gridEl) return;
        if (e.target.closest('.grid-cell-add')) return; // laisse le clic focaliser normalement le champ
        if (e.target.closest('.cell-sym-input')) return; // édition inline en cours (voir startInlineChordSymbolEdit) : laisse le focus/curseur natif faire son travail
        const section = +gridEl.dataset.section;

        const cell = e.target.closest('.grid-cell');
        if (cell) {
            const rect = cell.getBoundingClientRect();
            this.drag = {
                section,
                index: parseInt(cell.dataset.index),   // position vivante de l'accord déplacé
                origIndex: parseInt(cell.dataset.index),
                startX: e.clientX, startY: e.clientY,
                startTime: Date.now(),
                offsetX: e.clientX - rect.left,        // pour que le fantôme ne saute pas sous le doigt
                offsetY: e.clientY - rect.top,
                width: rect.width, height: rect.height,
                moved: false, ghost: null, cell,
                pointerType: e.pointerType || 'mouse',
                // Copier au lieu de déplacer (voir onGridPointerMove/onGridPointerUp) : Ctrl/Cmd+glisser
                // à la souris, connu tout de suite ; au doigt, seulement un appui déjà un peu long
                // (voir le seuil dans onGridPointerMove) SUIVI d'un glisser — un tap-glisser immédiat
                // reste un déplacement, comme avant.
                copy: e.ctrlKey || e.metaKey,
                // Clic pile sur le symbole affiché (voir onGridPointerUp) : un tap sans glisser dessus
                // ouvre directement l'édition inline de son texte plutôt que de sélectionner/écouter
                // l'accord — bien plus rapide que passer par le mode édition complet.
                symTarget: !!e.target.closest('.cell-sym'),
            };
            this._onMove = (ev) => this.onGridPointerMove(ev);
            this._onUp = (ev) => this.onGridPointerUp(ev);
            window.addEventListener('pointermove', this._onMove, { passive: false });
            window.addEventListener('pointerup', this._onUp);
            window.addEventListener('pointercancel', this._onUp);
        }

        // Change la partie active APRÈS avoir capturé les infos du geste ci-dessus (un re-rendu
        // détacherait `cell` du DOM et fausserait ses coordonnées)
        if (section !== this.activeSection) this.setActiveSection(section);
    }

    onGridPointerMove(e) {
        const d = this.drag;
        if (!d) return;
        const dx = e.clientX - d.startX, dy = e.clientY - d.startY;
        if (!d.moved && Math.hypot(dx, dy) < 6) return; // seuil : distinguer tap et glisser

        if (d.menuShown) {
            // Le menu contextuel s'est ouvert PENDANT cet appui (voir openContextMenu) mais le doigt
            // bouge avant d'être relâché : on referme le menu, l'appui était déjà assez long pour
            // qu'on considère la suite comme un glisser-copie plutôt qu'un déplacement.
            this.closeContextMenu();
            d.menuShown = false;
            d.copy = true;
        }

        if (!d.moved) {
            // Au doigt (pas Ctrl/Cmd, déjà tranché au clic) : un appui déjà tenu un moment avant que le
            // glisser ne commence bascule en copie — un tap-glisser immédiat reste un déplacement,
            // comme avant. Seuil sous les ~550ms du menu contextuel (voir attachContextMenuTrigger) :
            // le glisser aura déjà dépassé son propre seuil de 10px à ce moment-là, annulant le minuteur
            // du menu contextuel avant qu'il ne se déclenche.
            if (!d.copy && d.pointerType !== 'mouse' && (Date.now() - d.startTime) > 450) d.copy = true;
            d.moved = true;
            this.pushUndo(loadProgressionSections()); // un seul snapshot pour tout le geste de glisser
            d.ghost = this.createDragGhost(d.cell, d.width, d.height); // cloner tant que la case est attachée
            this.loadProgression();                                    // puis re-rendre (emplacement fantôme)
        }
        e.preventDefault();

        // Le fantôme suit le pointeur
        d.ghost.style.left = `${e.clientX - d.offsetX}px`;
        d.ghost.style.top = `${e.clientY - d.offsetY}px`;

        // Quel accord se trouve sous le pointeur ? (le fantôme est transparent aux événements).
        // On reste dans la MÊME partie : pas de glisser d'un accord d'une partie vers une autre.
        const under = document.elementFromPoint(e.clientX, e.clientY);
        const overCell = under && under.closest ? under.closest('.grid-cell') : null;
        if (overCell && +overCell.dataset.section === d.section) {
            const targetIndex = parseInt(overCell.dataset.index);
            if (!isNaN(targetIndex) && targetIndex !== d.index) {
                // Copie : l'original reste à sa place jusqu'au dépôt (voir onGridPointerUp,
                // duplicateChordTo) — seul le repère de case survolée (d.index) avance. Déplacement :
                // réagencement VIVANT comme avant, la grille se réorganise à chaque case survolée.
                if (!d.copy) this.moveChordLive(d.section, d.index, targetIndex);
                else this.loadProgression();
                d.index = targetIndex;
            }
        }
    }

    onGridPointerUp() {
        window.removeEventListener('pointermove', this._onMove);
        window.removeEventListener('pointerup', this._onUp);
        window.removeEventListener('pointercancel', this._onUp);
        const d = this.drag;
        this.drag = null;
        if (!d) return;

        if (d.ghost) d.ghost.remove();

        // Relâché sans bouger APRÈS que le menu contextuel s'est ouvert sur ce même appui (voir
        // openContextMenu/onGridPointerMove) : rien de plus à faire, pas de tap-sélection, le menu
        // reste normalement affiché pour qu'on y choisisse une action.
        if (d.menuShown && !d.moved) return;

        if (!d.moved) {
            if (d.symTarget) {
                // Tap/clic pile sur le texte de l'accord (voir onGridPointerDown) : édition inline
                // immédiate, pas de sélection/écoute ni d'attente d'un éventuel second tap.
                this._lastTap = null;
                this.startInlineChordSymbolEdit(d.section, d.index, d.cell);
                return;
            }
            const now = Date.now();
            const isSecondTap = this._lastTap && this._lastTap.section === d.section && this._lastTap.index === d.index && (now - this._lastTap.time) < 420;
            if (isSecondTap) {
                this._lastTap = null;
                this.editChord(d.section, d.index); // double-clic/double-tap = modifier
            } else {
                this._lastTap = { section: d.section, index: d.index, time: now };
                this.selectChord(d.section, d.index); // simple tap/clic = écouter
            }
            return;
        }
        if (d.copy) {
            // Rien n'a encore bougé (voir onGridPointerMove) : insère la copie à l'endroit déposé.
            this.duplicateChordTo(d.section, d.origIndex, d.index);
            return;
        }
        // La grille est déjà dans l'ordre final ; on répercute le déplacement sur sélection/édition
        this.selectedIndex = this._shiftIndex(this.selectedIndex, d.origIndex, d.index);
        this.editingIndex = this._shiftIndex(this.editingIndex, d.origIndex, d.index);
        this.loadProgression();
    }

    // Insère une COPIE de l'accord `fromIndex` à la position `toIndex` (voir onGridPointerUp,
    // Ctrl+glisser / appui long+glisser) — contrairement à moveChordLive, l'original reste en place ;
    // tout le reste (y compris l'original s'il est après le point d'insertion) décale d'un cran.
    // N'appelle PAS pushUndo : cette méthode n'est utilisée qu'en fin de glisser (onGridPointerUp),
    // dont le début (onGridPointerMove) a déjà pris l'unique instantané du geste — comme moveChordLive.
    duplicateChordTo(section, fromIndex, toIndex) {
        const sections = loadProgressionSections();
        const history = sections[section] && sections[section].chords;
        if (!history || !history[fromIndex]) return;
        const copy = { ...history[fromIndex] };
        const insertAt = Math.max(0, Math.min(toIndex, history.length));
        history.splice(insertAt, 0, copy);
        saveProgressionSections(sections);
        if (this.editingIndex != null && this.editingIndex >= insertAt) this.editingIndex++;
        this.selectedIndex = insertAt; // sélectionne la copie, comme duplicateChord (menu contextuel)
        this.loadProgression();
    }

    // Édition directe du texte d'un accord déjà en place (voir onGridPointerUp, tap sur .cell-sym) :
    // remplace le symbole affiché par un champ texte pré-rempli avec ce qui est déjà à l'écran (donc
    // déjà correctement orthographié dièses/bémols dans ce contexte), sur le même modèle que la case
    // "+" (addChordFromSymbol/parseChordSymbol) — seuls racine et qualité changent, tout le reste de
    // l'accord (durée, style, instrument, renversement/drop/basse) reste inchangé. La basse éventuelle
    // ("C7/E") et le repère de continuation ("↩") sont retirés du texte proposé : parseChordSymbol ne
    // sait lire qu'un symbole racine+qualité, pas une basse — cohérent avec la saisie rapide existante,
    // où renversement/drop/basse restent réglables uniquement en ouvrant le mode édition complet.
    startInlineChordSymbolEdit(section, index, cell) {
        cell = cell || document.querySelector(`.grid-cell[data-section="${section}"][data-index="${index}"]`);
        const symEl = cell && cell.querySelector('.cell-sym');
        if (!symEl || symEl.tagName === 'INPUT') return; // déjà en édition ou case introuvable

        let displayText = (symEl.textContent || '').trim();
        displayText = displayText.replace(/↩\s*$/, '').trim();
        displayText = displayText.replace(/\/.*$/, '').trim();

        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'cell-sym-input';
        input.value = displayText;
        input.autocomplete = 'off';
        input.autocapitalize = 'off';
        input.spellcheck = false;
        symEl.replaceWith(input);
        input.focus();
        input.select();

        let done = false;
        const commit = () => {
            if (done) return;
            done = true;
            const parsed = parseChordSymbol(input.value);
            if (!parsed) {
                if (input.value.trim()) this.flashHint('Accord non reconnu (ex. Cm7, F#dim, Bbadd9)');
                this.loadProgression();
                return;
            }
            const sections = loadProgressionSections();
            const data = sections[section] && sections[section].chords[index];
            if (!data) { this.loadProgression(); return; }
            this.pushUndo(sections);
            data.root = parsed.root;
            data.quality = parsed.quality;
            saveProgressionSections(sections);
            hasUnsavedChanges = true;
            // Si c'est l'accord actuellement en mode édition complète, resynchronise le panneau Accord
            // (réglages/séquenceur) avec la nouvelle racine/qualité plutôt que de le laisser périmé.
            if (this.editingIndex === index && this.activeSection === section) this.editChord(section, index);
            else this.loadProgression();
        };
        input.addEventListener('blur', commit);
        input.addEventListener('keydown', (e) => {
            e.stopPropagation();
            if (e.key === 'Enter') { e.preventDefault(); commit(); }
            else if (e.key === 'Escape') { e.preventDefault(); done = true; this.loadProgression(); }
        });
    }

    // ---------- Plage à boucler (glisser sur la ligne des numéros de mesure) ----------
    // Glisser directement sur les accords sert déjà à les réordonner (voir onGridPointerDown) : on
    // déclenche donc ce geste-ci uniquement depuis la fine ligne de numéros de mesure sous la grille
    // (.row-measure), jamais utilisée pour autre chose — comme la règle/barre de cycle de GarageBand.
    setupLoopRangeInteractions() {
        const host = document.getElementById('progression-sections');
        host.addEventListener('pointerdown', (e) => this.onLoopRangeStart(e));
    }

    // Retrouve l'accord (index) sous un point (clientX/clientY), à partir de la géométrie de la
    // grille CSS elle-même (colonnes = temps, lignes = paires accords/numéros) plutôt que d'un
    // element-from-point : la ligne des numéros n'a d'élément qu'aux débuts de mesure (colonnes
    // creuses sinon), on ne peut donc pas se contenter d'un hit-test dessus.
    chordIndexAtPoint(gridEl, section, clientX, clientY) {
        const rect = gridEl.getBoundingClientRect();
        const beatsPerRow = parseInt(gridEl.dataset.beatsPerRow) || 16;
        const cs = getComputedStyle(gridEl);
        const rowH = parseFloat(cs.getPropertyValue('--row-h')) || 64;
        const measureRowH = parseFloat(cs.getPropertyValue('--measure-row-h')) || 15;
        const col = Math.max(0, Math.min(beatsPerRow - 1, Math.floor((clientX - rect.left) / (rect.width / beatsPerRow))));
        const row = Math.max(0, Math.floor((clientY - rect.top) / (rowH + measureRowH)));
        const history = loadProgressionSections()[section]?.chords;
        if (!history || history.length === 0) return null;
        const { cells } = this.layoutProgression(history, this.beatsPerBar());
        const seg = cells.find(s => s.row === row && col >= s.col && col < s.col + s.span);
        return seg ? seg.index : null;
    }

    // Trois façons de commencer un geste sur la plage à boucler, selon l'élément visé :
    //  - une poignée (.loop-range-handle-left/right) : étire CE bord seul, l'autre reste fixe ;
    //  - le corps d'une bande déjà là (.loop-range-bar) : un simple tap (sans bouger, voir
    //    onLoopRangeEnd) la SUPPRIME ; un glisser la redéfinit depuis ce point, comme ci-dessous ;
    //  - la ligne des numéros de mesure ailleurs (.row-measure) : définit une nouvelle plage depuis
    //    ce point (comportement historique, inchangé).
    onLoopRangeStart(e) {
        if (e.button != null && e.button !== 0) return; // clic gauche / toucher uniquement
        const handle = e.target.closest('.loop-range-handle');
        const bar = e.target.closest('.loop-range-bar');
        if (!handle && !bar && !e.target.closest('.row-measure')) return;
        const gridEl = e.target.closest('.chord-grid');
        if (!gridEl) return;
        e.preventDefault();
        e.stopPropagation(); // n'ouvre pas aussi le glisser-déposer (réordonner) de la grille
        const section = +gridEl.dataset.section;
        const range = this.loopRange;

        // Ne PAS garder `gridEl` : setLoopRange() re-rend la grille (loadProgression), ce qui
        // remplace tout le sous-arbre DOM — l'élément capturé ici deviendrait détaché dès le premier
        // appel, faussant tout calcul de géométrie basé dessus par la suite (voir chordIndexAtPoint).
        // On re-cherche la grille VIVANTE (par data-section) à chaque déplacement à la place.
        if (handle) {
            if (!range || range.section !== section) return;
            const edge = handle.dataset.edge;
            this.loopRangeDrag = { section, mode: edge === 'left' ? 'edge-left' : 'edge-right', fixed: edge === 'left' ? range.end : range.start, moved: false };
        } else if (bar) {
            // Tap sans bouger = supprime (voir onLoopRangeEnd) ; glisser = redéfinit depuis ce point,
            // exactement comme un glisser démarré ailleurs sur la ligne — seul le tap immobile change
            // de sens ici, d'où un mode distinct ('bar-tap') malgré une logique de glisser identique.
            if (!range || range.section !== section) return;
            const anchor = this.chordIndexAtPoint(gridEl, section, e.clientX, e.clientY);
            if (anchor == null) return;
            this.loopRangeDrag = { section, mode: 'bar-tap', anchor, moved: false };
        } else {
            const index = this.chordIndexAtPoint(gridEl, section, e.clientX, e.clientY);
            if (index == null) return;
            this.loopRangeDrag = { section, mode: 'new', anchor: index, moved: false };
            this.setLoopRange(section, index, index);
        }

        this.loopRangeDragStart = { x: e.clientX, y: e.clientY };
        this._onLoopRangeMove = (ev) => this.onLoopRangeMove(ev);
        this._onLoopRangeUp = () => this.onLoopRangeEnd();
        window.addEventListener('pointermove', this._onLoopRangeMove);
        window.addEventListener('pointerup', this._onLoopRangeUp);
        window.addEventListener('pointercancel', this._onLoopRangeUp);
    }

    onLoopRangeMove(e) {
        const d = this.loopRangeDrag;
        if (!d) return;
        const start = this.loopRangeDragStart;
        if (!d.moved && Math.hypot(e.clientX - start.x, e.clientY - start.y) < 6) return; // seuil : distingue un tap d'un glisser
        d.moved = true;

        const gridEl = document.querySelector(`.chord-grid[data-section="${d.section}"]`);
        if (!gridEl) return;
        const index = this.chordIndexAtPoint(gridEl, d.section, e.clientX, e.clientY);
        if (index == null) return;

        if (d.mode === 'edge-left') {
            // Bloquée au bord fixe (pas au-delà) : sinon la poignée gauche glissée au-delà de la
            // droite inverserait silencieusement leurs rôles (voir setLoopRange, qui réordonne start/end).
            this.setLoopRange(d.section, Math.min(index, d.fixed), d.fixed);
        } else if (d.mode === 'edge-right') {
            this.setLoopRange(d.section, d.fixed, Math.max(index, d.fixed));
        } else {
            const lo = Math.min(d.anchor, index), hi = Math.max(d.anchor, index);
            if (!this.loopRange || this.loopRange.start !== lo || this.loopRange.end !== hi) {
                this.setLoopRange(d.section, lo, hi);
            }
        }
    }

    onLoopRangeEnd() {
        window.removeEventListener('pointermove', this._onLoopRangeMove);
        window.removeEventListener('pointerup', this._onLoopRangeUp);
        window.removeEventListener('pointercancel', this._onLoopRangeUp);
        const d = this.loopRangeDrag;
        this.loopRangeDrag = null;
        this.loopRangeDragStart = null;
        // Tap (sans glisser) pile sur une bande déjà là, pas sur une poignée : la supprime — sans ça,
        // aucun moyen tactile d'annuler une plage à boucler une fois posée.
        if (d && d.mode === 'bar-tap' && !d.moved && this.loopRange && this.loopRange.section === d.section) {
            this.loopRange = null;
            this.loadProgression();
        }
    }

    setLoopRange(section, start, end) {
        this.loopRange = { section, start: Math.min(start, end), end: Math.max(start, end) };
        this.loadProgression();
    }

    // Bande(s) façon barre de cycle (GarageBand) marquant la plage à boucler, sur la ligne des
    // numéros de mesure — une par LIGNE de la grille effectivement couverte (un accord scindé sur
    // plusieurs lignes, ou une plage qui déborde sur la ligne suivante, ont chacun leur propre bande).
    // Poignées d'étirement (voir .loop-range-handle) posées UNIQUEMENT sur le vrai bord de la plage
    // (premier segment de loopRange.start, dernier segment de loopRange.end) : une bande intermédiaire
    // (plage qui traverse plusieurs lignes) n'a pas de poignée, ses bords ne sont que des retours à la
    // ligne, pas de vraies extrémités déplaçables. Poignées posées comme éléments de grille INDÉPENDANTS
    // (pas imbriquées dans .loop-range-bar) : imbriquées, leur z-index resterait piégé dans le contexte
    // d'empilement isolé de la bande (position+z-index), sans jamais pouvoir passer devant .row-measure
    // — qui occupe pourtant la case juste là la plupart du temps (un bord de plage tombe presque
    // toujours sur un début de mesure).
    buildLoopRangeBars(cells, loopRange) {
        if (!loopRange) return '';
        const byRow = new Map();
        cells.forEach(s => {
            if (s.index < loopRange.start || s.index > loopRange.end) return;
            const r = byRow.get(s.row) || { minCol: s.col, maxCol: s.col + s.span };
            r.minCol = Math.min(r.minCol, s.col);
            r.maxCol = Math.max(r.maxCol, s.col + s.span);
            byRow.set(s.row, r);
        });
        const startCell = cells.find(s => s.index === loopRange.start && s.isFirst);
        const endCell = cells.find(s => s.index === loopRange.end && s.isLast);
        const bars = Array.from(byRow.entries()).map(([row, r]) => `
                    <div class="loop-range-bar" style="grid-column: ${r.minCol + 1} / ${r.maxCol + 1}; grid-row: ${row * 2 + 2};"></div>`
        ).join('');
        const leftHandle = startCell ? `
                    <div class="loop-range-handle loop-range-handle-left" data-edge="left" style="grid-column: ${startCell.col + 1} / span 1; grid-row: ${startCell.row * 2 + 2};"></div>` : '';
        const rightHandle = endCell ? `
                    <div class="loop-range-handle loop-range-handle-right" data-edge="right" style="grid-column: ${endCell.col + endCell.span} / span 1; grid-row: ${endCell.row * 2 + 2};"></div>` : '';
        return bars + leftHandle + rightHandle;
    }

    // Case "+" en bout de grille (une par partie) : un simple champ texte (placeholder "+"), pour
    // taper un accord directement dedans (voir addChordFromSymbol/onAddCellKeydown) sans repasser par
    // le champ d'ajout rapide séparé — pratique maintenant que les accords se réordonnent par glisser
    // (voir onGridPointerDown), plus besoin d'ajouter au bon endroit du premier coup.
    buildAddCellHtml(section, row, col, span) {
        return `
                    <div class="grid-cell grid-cell-add" style="grid-column: ${col + 1} / span ${span}; grid-row: ${row * 2 + 1};">
                        <input type="text" class="cell-add-input" data-section="${section}" placeholder="+" autocomplete="off" autocapitalize="off" spellcheck="false">
                    </div>`;
    }

    // ---------- Étirement d'un accord (durée) directement dans la grille ----------
    // Glisser la poignée au bord droit du DERNIER segment d'un accord change sa durée par pas d'un
    // temps entier (comme toutes les durées de l'appli), sans repasser par le panneau Accord. Le
    // bord GAUCHE du PREMIER segment fait de même mais symétriquement : il emprunte/rend des temps à
    // l'accord PRÉCÉDENT (glisser vers la gauche agrandit l'accord courant et réduit le précédent
    // d'autant, et inversement) — les deux accords restent toujours à 1 temps minimum.
    onResizeStart(e, section, index, edge) {
        if (e.button != null && e.button !== 0) return; // clic gauche / toucher uniquement
        e.stopPropagation(); // n'ouvre pas aussi le glisser-déposer (réordonner) de la grille
        e.preventDefault();
        const sections = loadProgressionSections();
        const history = sections[section] && sections[section].chords;
        const data = history && history[index];
        if (!data) return;
        const prevData = (edge === 'left') ? history[index - 1] : null;
        if (edge === 'left' && !prevData) return; // pas d'accord précédent à réduire
        const grid = e.target.closest('.chord-grid');
        const beatsPerRow = parseInt(grid.dataset.beatsPerRow) || 16;
        const colWidth = grid.getBoundingClientRect().width / beatsPerRow;
        // Grille pas encore mesurable (largeur nulle : masquée, en transition...) : pas de division
        // par zéro plus loin (onResizeMove), qui produirait un delta Infinity/NaN et corromprait
        // durablement la durée de l'accord (voir beatsFromData).
        if (!(colWidth > 0)) return;

        this.resize = {
            section, index, edge,
            startX: e.clientX,
            startBeats: beatsFromData(data),
            startPrevBeats: prevData ? beatsFromData(prevData) : null,
            colWidth,
            lastDelta: 0,
        };
        this._onResizeMove = (ev) => this.onResizeMove(ev);
        this._onResizeEnd = () => this.onResizeEnd();
        window.addEventListener('pointermove', this._onResizeMove, { passive: false });
        window.addEventListener('pointerup', this._onResizeEnd);
        window.addEventListener('pointercancel', this._onResizeEnd);
    }

    onResizeMove(e) {
        const r = this.resize;
        if (!r) return;
        e.preventDefault();
        const dxBeats = Math.round((e.clientX - r.startX) / r.colWidth);

        let delta; // temps ajoutés à l'accord courant (bord droit : direct : bord gauche : inversé,
                   // glisser à gauche = dx négatif doit AGRANDIR l'accord courant)
        if (r.edge === 'left') {
            delta = -dxBeats;
            // bornes : l'accord courant et le précédent restent chacun à 1 temps minimum
            delta = Math.max(1 - r.startBeats, Math.min(r.startPrevBeats - 1, delta));
        } else {
            delta = Math.max(1 - r.startBeats, dxBeats);
        }
        if (delta === r.lastDelta) return;
        r.lastDelta = delta;

        if (!r.pushedUndo) { this.pushUndo(loadProgressionSections()); r.pushedUndo = true; }
        const sections = loadProgressionSections();
        const history = sections[r.section] && sections[r.section].chords;
        const data = history && history[r.index];
        if (!data) return;
        data.beats = r.startBeats + delta;
        if (r.edge === 'left') {
            const prevData = history[r.index - 1];
            if (prevData) prevData.beats = r.startPrevBeats - delta;
        }
        saveProgressionSections(sections);
        this.loadProgression();
    }

    onResizeEnd() {
        window.removeEventListener('pointermove', this._onResizeMove);
        window.removeEventListener('pointerup', this._onResizeEnd);
        window.removeEventListener('pointercancel', this._onResizeEnd);
        this.resize = null;
    }

    // Crée un clone flottant de la case en cours de déplacement
    createDragGhost(cell, width, height) {
        const rect = cell.getBoundingClientRect();
        const ghost = cell.cloneNode(true);
        ghost.classList.add('drag-ghost');
        ghost.classList.remove('selected', 'editing', 'drag-placeholder');
        ghost.style.width = `${width || rect.width}px`;
        ghost.style.height = `${height || rect.height}px`;
        document.body.appendChild(ghost);
        return ghost;
    }

    // Déplace l'accord `from` -> `to` en direct, au sein d'une même partie (écrit et re-rend,
    // sans toucher sélection/édition)
    moveChordLive(section, from, to) {
        const sections = loadProgressionSections();
        const history = sections[section] && sections[section].chords;
        if (!history || from < 0 || from >= history.length || to < 0 || to >= history.length) return;
        const [item] = history.splice(from, 1);
        history.splice(to, 0, item);
        saveProgressionSections(sections);
        this.loadProgression();
    }

    // Recalcule un index après déplacement d'un élément de `from` vers `to`
    _shiftIndex(idx, from, to) {
        if (idx == null) return null;
        if (idx === from) return to;
        if (from < idx && idx <= to) return idx - 1;
        if (to <= idx && idx < from) return idx + 1;
        return idx;
    }

    // ---------- Séquenceur pas-à-pas (résolution croche, disponible pour tous les styles) ----------

    // Motif tel que stocké dans l'interface, ajusté (tronqué/complété/voix filtrées) à cet accord.
    // Renvoie { pattern, tie }.
    getLiveSeqPattern(chord) {
        const steps = chord.beats * SEQ_STEPS_PER_BEAT;
        const voices = chord.getSeqMidiNotes().length;
        const { pattern, tie } = parseSeqPattern(document.getElementById('arpPattern').value);
        return resizeSeqPattern(pattern, tie, steps, voices);
    }

    setLiveSeqPattern(pattern, tie) {
        document.getElementById('arpPattern').value = serializeSeqPattern(pattern, tie);
    }

    // Garde le motif cohérent avec l'accord courant, qu'on ait ouvert le panneau séquenceur ou non
    // (sinon la sauvegarde figerait un motif invalide ou périmé). Tant que rien n'a été personnalisé
    // (this.seqTouched === false), on suit simplement le style de lecture choisi.
    syncSeqPatternForCurrentChord() {
        const chord = this.readChord();
        const steps = chord.beats * SEQ_STEPS_PER_BEAT;
        const voices = chord.getSeqMidiNotes().length;
        let result;
        if (this.seqTouched) {
            const parsed = parseSeqPattern(document.getElementById('arpPattern').value);
            result = resizeSeqPattern(parsed.pattern, parsed.tie, steps, voices);
        } else {
            result = seqPreset(document.getElementById('playStyle').value, voices, steps);
        }
        this.setLiveSeqPattern(result.pattern, result.tie);
        return chord;
    }

    // Motif à jouer pour un accord SAUVEGARDÉ. Avant le séquenceur généralisé, seul le style
    // « Arpège » utilisait vraiment le champ arpPattern (Maintenu/Par temps l'ignoraient) : pour les
    // sauvegardes antérieures (sans le marqueur seqEdited), on régénère donc le motif-type du style
    // plutôt que de faire confiance à un arpPattern hérité qui ne correspond à rien. Renvoie { pattern, tie }.
    resolveSeqPatternForData(chord, data) {
        const steps = chord.beats * SEQ_STEPS_PER_BEAT;
        const voices = chord.getSeqMidiNotes().length;
        const style = data.playStyle || 'held';
        const trustStored = data.seqEdited || style === 'arpeggio';
        if (!trustStored) return seqPreset(style, voices, steps);
        const { pattern, tie } = parseSeqPattern(data.arpPattern);
        return resizeSeqPattern(pattern, tie, steps, voices);
    }

    // Glisser sur la grille pour étirer/effacer une note sur plusieurs croches d'affilée (souris et
    // tactile) : on délègue depuis le conteneur stable #arp-sequencer, qui survit aux re-rendus de
    // la grille (contrairement aux cases elles-mêmes, reconstruites à chaque renderSequencer()).
    setupSequencerInteractions() {
        const host = document.getElementById('arp-sequencer');
        host.addEventListener('pointerdown', (e) => this.onSeqPointerDown(e));
    }

    // Le geste n'est appliqué qu'à la fin (voir onSeqPointerUp) : un simple tap sur une note déjà
    // posée la SÉLECTIONNE au lieu de l'effacer immédiatement ; ce n'est qu'un vrai glissé (mouvement
    // détecté) qui peint/efface plusieurs croches d'affilée.
    onSeqPointerDown(e) {
        if (e.button != null && e.button !== 0) return; // clic gauche / toucher uniquement

        const cell = e.target.closest('.seq-cell');
        if (!cell) return;

        const voice = +cell.dataset.voice, step = +cell.dataset.step;
        const wasOn = cell.classList.contains('on');
        const chord = this.readChord();
        const { pattern, tie } = this.getLiveSeqPattern(chord);

        // Si la croche touchée appartient à une note existante ET qu'elle en est le DÉBUT, la FIN,
        // ou l'unique croche, un glissé pourra étirer/raccourcir la note depuis ce bord. Mais un
        // simple tap (sans glisser) se contente TOUJOURS de sélectionner, exactement comme au milieu
        // d'une note : cliquer ne modifie jamais rien, seul un vrai glissé le fait.
        let resize = null;
        if (wasOn) {
            let start = step, end = step;
            while (start > 0 && pattern[start - 1].includes(voice) && tie[start].includes(voice)) start--;
            while (end + 1 < pattern.length && pattern[end + 1].includes(voice) && tie[end + 1].includes(voice)) end++;
            const isStart = (step === start), isEnd = (step === end);
            if (isStart || isEnd) {
                const { minStart, maxEnd } = this.seqNeighborBounds(pattern, voice, start, end);
                // 'auto' pour une note d'une seule croche : le sens du tout premier glissé décide du bord
                const edge = (isStart && isEnd) ? 'auto' : (isStart ? 'start' : 'end');
                resize = { edge, noteStart: start, noteEnd: end, minStart, maxEnd };
            }
        }

        // Ctrl/Cmd enfoncé : le tap (sans glisser) ajoutera/retirera cette note de la sélection au
        // lieu de la remplacer — voir onSeqPointerUp. N'affecte pas le glissé de peinture/effacement.
        // origOnSteps (peinture uniquement) : instantané, AVANT ce geste, des croches actives de cette
        // voix — sert à détecter qu'on peint juste à côté d'une note déjà là (voir onSeqPointerMove),
        // pour la prolonger au lieu de créer une seconde note non liée juste accolée à la première.
        this.seqDrag = {
            mode: 'paint', voice, wasOn, startStep: step, lastStep: step, moved: false,
            rowCells: null, touched: {}, additive: e.ctrlKey || e.metaKey,
            resize, resizeChanged: false, crossedThreshold: false,
            curStart: resize ? resize.noteStart : null, curEnd: resize ? resize.noteEnd : null,
            noteEl: null, startX: e.clientX, startY: e.clientY,
            origOnSteps: resize ? null : pattern.map(cell => cell.includes(voice)),
        };

        this._onSeqMove = (ev) => this.onSeqPointerMove(ev);
        this._onSeqUp = () => this.onSeqPointerUp();
        window.addEventListener('pointermove', this._onSeqMove, { passive: false });
        window.addEventListener('pointerup', this._onSeqUp);
        window.addEventListener('pointercancel', this._onSeqUp);
    }

    // Bornes dans lesquelles une note peut être étirée sans empiéter sur la note voisine de LA MÊME
    // voix (celle qu'on redimensionne étant elle-même exclue du calcul, puisqu'on cherche la première
    // croche occupée au-delà de ses propres bornes actuelles, dans chaque direction).
    seqNeighborBounds(pattern, voice, start, end) {
        let minStart = 0;
        for (let s = start - 1; s >= 0; s--) {
            if (pattern[s].includes(voice)) { minStart = s + 1; break; }
        }
        let maxEnd = pattern.length - 1;
        for (let s = end + 1; s < pattern.length; s++) {
            if (pattern[s].includes(voice)) { maxEnd = s - 1; break; }
        }
        return { minStart, maxEnd };
    }

    // Retrouve la croche survolée par une recherche géométrique dans la voix d'origine, plutôt qu'un
    // elementFromPoint strict : une souris/un doigt qui dérive légèrement dans un interstice (gap entre
    // cases, bordure...) ne doit pas interrompre le glissé — c'est ce qui rendait l'étirement peu fiable.
    findSeqStepAt(d, clientX, clientY) {
        if (!d.rowCells) {
            d.rowCells = Array.from(document.querySelectorAll(`.seq-cell[data-voice="${d.voice}"]`))
                .map(el => ({ step: +el.dataset.step, rect: el.getBoundingClientRect() }));
        }
        let best = null, bestDist = Infinity;
        for (const c of d.rowCells) {
            if (clientY < c.rect.top - 40 || clientY > c.rect.bottom + 40) continue; // hors de cette ligne
            const dist = clientX < c.rect.left ? c.rect.left - clientX : (clientX > c.rect.right ? clientX - c.rect.right : 0);
            if (dist < bestDist) { bestDist = dist; best = c; }
        }
        return best ? best.step : null;
    }

    // Mémorise l'état d'origine (avant ce glissé) d'une croche la première fois qu'elle est touchée,
    // pour pouvoir la restaurer fidèlement si le geste revient en arrière et la sort de la plage.
    rememberSeqOriginalState(d, step) {
        if (d.touched[step]) return;
        const chord = this.readChord();
        const { pattern, tie } = this.getLiveSeqPattern(chord);
        d.touched[step] = { on: pattern[step].includes(d.voice), tied: tie[step].includes(d.voice) };
    }

    onSeqPointerMove(e) {
        const d = this.seqDrag;
        if (!d) return;
        if (d.resize) { this.onSeqResizeMove(e, d); return; }

        // Même garde-fou que pour le redimensionnement (voir onSeqResizeMove) : sans lui, le moindre
        // tremblement de souris/doigt au clic — surtout sur des cases étroites — peut franchir la
        // case voisine et être lu comme un glissé, ce qui efface une croche par accident (scindant
        // une note visuellement) et écrase la sélection au lieu de simplement sélectionner/Ctrl+sélectionner.
        if (!d.crossedThreshold) {
            const dx = e.clientX - d.startX, dy = e.clientY - d.startY;
            if (Math.hypot(dx, dy) < 8) return;
            d.crossedThreshold = true;
        }

        const step = this.findSeqStepAt(d, e.clientX, e.clientY);
        if (step == null) return;
        if (step === d.lastStep && d.moved) return;

        e.preventDefault(); // glissé horizontal reconnu -> on empêche le scroll de page de le voler
        this.pushSeqUndo(); // un seul instantané pour tout le glissé, pas un par croche traversée
        d.moved = true;

        // Le point de départ décide : geste commencé sur une case éteinte -> on peint (note tenue,
        // liée à partir de la 2e croche parcourue) ; commencé sur une case allumée -> on efface.
        const paintOn = !d.wasOn;
        const newFrom = Math.min(step, d.startStep), newTo = Math.max(step, d.startStep);

        // Fusionne avec une note déjà là, juste avant ou juste après la zone peinte (état d'AVANT ce
        // geste, voir origOnSteps), au lieu de toujours attaquer une nouvelle note à l'endroit où le
        // doigt a touché en premier — sans quoi glisser depuis la case vide juste à côté d'une note
        // pour l'« étirer » créait une seconde note non liée juste accolée à la première : visuellement
        // scindée en deux, et seule cette nouvelle partie se sélectionnait ensuite.
        const mergeLeft = paintOn && newFrom > 0 && d.origOnSteps[newFrom - 1];
        const mergeRight = paintOn && newTo + 1 < d.origOnSteps.length && d.origOnSteps[newTo + 1];

        // La note existante à droite, si fusion, continue maintenant ce qu'on vient de peindre : sa
        // toute première croche (hors de [newFrom, newTo]) passe donc aussi sous la responsabilité de
        // ce geste (suivie/restaurable comme le reste — voir d.touched — si le glissé revient en
        // arrière avant d'être relâché).
        const effTo = mergeRight ? newTo + 1 : newTo;

        // Aller-retour du geste : restaure hors de la nouvelle plage les croches déjà modifiées
        if (d.rangeFrom != null) {
            for (let s = d.rangeFrom; s <= d.rangeTo; s++) {
                if (s < newFrom || s > effTo) {
                    const orig = d.touched[s];
                    this.applySeqCell(d.voice, s, orig.on, orig.tied);
                }
            }
        }
        for (let s = newFrom; s <= newTo; s++) {
            this.rememberSeqOriginalState(d, s);
            const isAttack = paintOn && !mergeLeft && s === newFrom;
            this.applySeqCell(d.voice, s, paintOn, paintOn && !isAttack);
        }
        if (mergeRight) {
            this.rememberSeqOriginalState(d, newTo + 1);
            this.applySeqCell(d.voice, newTo + 1, true, true);
        }
        d.rangeFrom = newFrom;
        d.rangeTo = effTo;
        d.lastStep = step;
    }

    // Glissé démarré sur le bord d'une note existante (ou son unique croche) : étend/raccourcit
    // depuis ce bord, sans jamais empiéter sur la note voisine de la même voix (bornes calculées une
    // seule fois à la prise, cf. seqNeighborBounds). Un simple clic sans glisser réel ne modifie
    // jamais rien : onSeqPointerUp retombe alors sur le comportement de sélection habituel.
    onSeqResizeMove(e, d) {
        // Seuil avant de considérer que c'est un vrai glissé (et non un simple tap pour sélectionner) :
        // le moindre tremblement au clic/toucher (souris, trackpad, doigt) ne doit jamais être lu
        // comme une intention de modifier. Tant que ce seuil n'est pas franchi, on ne touche à rien.
        if (!d.crossedThreshold) {
            const dx = e.clientX - d.startX, dy = e.clientY - d.startY;
            if (Math.hypot(dx, dy) < 8) return;
            d.crossedThreshold = true;
        }

        const step = this.findSeqStepAt(d, e.clientX, e.clientY);
        if (step == null) return;

        // Note d'une seule croche : le sens du tout premier mouvement décide quel bord on manipule
        if (d.resize.edge === 'auto') {
            if (step > d.resize.noteStart) d.resize.edge = 'end';
            else if (step < d.resize.noteStart) d.resize.edge = 'start';
            else return; // toujours sur la même case : direction pas encore déterminée
        }

        let newStart = d.curStart, newEnd = d.curEnd;
        if (d.resize.edge === 'end') {
            newEnd = Math.max(d.resize.noteStart, Math.min(step, d.resize.maxEnd));
        } else {
            newStart = Math.min(d.resize.noteEnd, Math.max(step, d.resize.minStart));
        }
        if (newStart === d.curStart && newEnd === d.curEnd) return;

        e.preventDefault();
        if (!d.resizeChanged) {
            this.pushSeqUndo(); // un seul instantané pour tout le glissé de redimensionnement
            // Repère l'élément visuel de la note pour l'étirer en direct pendant le glissé
            d.noteEl = document.querySelector(
                `.seq-note[data-voice="${d.voice}"][data-start="${d.resize.noteStart}"][data-end="${d.resize.noteEnd}"]`
            );
        }
        d.resizeChanged = true;

        // Réapplique toute la plage traversée par ce geste : les croches désormais hors [newStart,
        // newEnd] s'éteignent, celles qui y entrent s'allument (liées entre elles, sauf la toute
        // première = attaque). Un seul passage suffit même en cas d'aller-retour du pointeur.
        const lo = Math.min(d.curStart, newStart, d.resize.noteStart);
        const hi = Math.max(d.curEnd, newEnd, d.resize.noteEnd);
        for (let s = lo; s <= hi; s++) {
            const within = s >= newStart && s <= newEnd;
            this.applySeqCell(d.voice, s, within, within && s !== newStart);
        }
        d.curStart = newStart;
        d.curEnd = newEnd;

        // Étire/déplace la pilule visuelle EN DIRECT, sans attendre le renderSequencer() final
        // (les cases en dessous, elles, sont déjà mises à jour case par case via applySeqCell ci-dessus)
        if (d.noteEl) {
            d.noteEl.style.gridColumn = `${newStart + 2} / span ${newEnd - newStart + 1}`;
            d.noteEl.style.marginRight = (newEnd % 2 === 1) ? '4px' : '0';
        }
    }

    onSeqPointerUp() {
        window.removeEventListener('pointermove', this._onSeqMove);
        window.removeEventListener('pointerup', this._onSeqUp);
        window.removeEventListener('pointercancel', this._onSeqUp);
        const d = this.seqDrag;
        this.seqDrag = null;
        if (!d) return;

        if (d.resize) {
            if (d.resizeChanged) {
                this.seqTouched = true;
                this.seqSelections = [{ voice: d.voice, start: d.curStart, end: d.curEnd }];
                this.renderSequencer();
                return;
            }
            // Sinon : simple tap sur le bord d'une note, sans glissé réel -> retombe sur le
            // comportement de sélection habituel juste en dessous (c'est exactement le point :
            // cliquer ne doit jamais modifier une note, seul un vrai glissé le fait).
        }

        if (!d.moved) {
            // Simple tap, sans glisser
            if (d.wasOn) {
                this.selectSeqNoteAt(d.voice, d.startStep, d.additive); // sélectionne (ou ajoute/retire si Ctrl), ne la touche pas
            } else if (!d.additive) {
                // Ctrl/Cmd enfoncé sur une case vide : ne peint rien (Ctrl sert uniquement à sélectionner)
                this.pushSeqUndo();
                this.applySeqCell(d.voice, d.startStep, true, false); // nouvelle note isolée, rejouée
                this.selectSeqNoteAt(d.voice, d.startStep);
            }
        } else {
            // Glissé terminé : sélectionne la note qui vient d'être dessinée, ou rien si on a effacé
            if (d.wasOn) this.seqSelections = [];
            else this.selectSeqNoteAt(d.voice, d.startStep);
        }
        this.renderSequencer();
    }

    // Allume/éteint une case précise (et sa liaison à la précédente) et met à jour le motif stocké,
    // sans reconstruire toute la grille (indispensable pour que le glissé reste fluide, au doigt aussi)
    applySeqCell(voice, step, on, tied = false) {
        const chord = this.readChord();
        const { pattern, tie } = this.getLiveSeqPattern(chord);
        const wasOn = pattern[step].includes(voice);
        const wasTied = tie[step].includes(voice);
        if (on && wasOn && wasTied === tied) return;  // rien à changer
        if (!on && !wasOn) return;                    // déjà silencieuse

        if (on) {
            if (!wasOn) pattern[step].push(voice);
            if (tied && !wasTied) tie[step].push(voice);
            if (!tied && wasTied) tie[step].splice(tie[step].indexOf(voice), 1);
        } else {
            pattern[step].splice(pattern[step].indexOf(voice), 1);
            if (wasTied) tie[step].splice(tie[step].indexOf(voice), 1);
            // la croche suivante ne peut plus être liée à une croche désormais silencieuse
            if (step + 1 < tie.length) {
                const nt = tie[step + 1].indexOf(voice);
                if (nt >= 0) tie[step + 1].splice(nt, 1);
            }
        }

        this.seqTouched = true;
        this.setLiveSeqPattern(pattern, tie);
        const cell = document.querySelector(`.seq-cell[data-step="${step}"][data-voice="${voice}"]`);
        if (cell) cell.classList.toggle('on', on);
    }

    // Sélectionne la note (isolée ou pilule) à laquelle appartient cette croche, pour cette voix.
    // `additive` (Ctrl/Cmd enfoncé) : ajoute/retire cette note de la sélection au lieu de la
    // remplacer, pour permettre d'en sélectionner plusieurs à la fois (ex. avant une suppression groupée).
    selectSeqNoteAt(voice, step, additive = false) {
        const chord = this.readChord();
        const { pattern, tie } = this.getLiveSeqPattern(chord);
        if (!pattern[step] || !pattern[step].includes(voice)) {
            if (!additive) this.seqSelections = [];
            return;
        }
        let start = step, end = step;
        while (start > 0 && pattern[start - 1].includes(voice) && tie[start].includes(voice)) start--;
        while (end + 1 < pattern.length && pattern[end + 1].includes(voice) && tie[end + 1].includes(voice)) end++;

        if (!additive) { this.seqSelections = [{ voice, start, end }]; return; }
        const idx = this.seqSelections.findIndex(s => s.voice === voice && s.start === start);
        if (idx >= 0) this.seqSelections.splice(idx, 1); // déjà sélectionnée -> Ctrl+clic la retire
        else this.seqSelections.push({ voice, start, end });
    }

    // Supprime entièrement toutes les notes actuellement sélectionnées (touche Suppr/Retour arrière,
    // bouton dédié, ou double-tap tactile) — une seule lecture/écriture du motif même à plusieurs.
    deleteSelectedSeqNote() {
        if (this.seqSelections.length === 0) return;
        this.pushSeqUndo();
        const chord = this.readChord();
        const { pattern, tie } = this.getLiveSeqPattern(chord);
        this.seqSelections.forEach(sel => {
            for (let s = sel.start; s <= sel.end; s++) {
                const at = pattern[s].indexOf(sel.voice);
                if (at >= 0) pattern[s].splice(at, 1);
                const ti = tie[s].indexOf(sel.voice);
                if (ti >= 0) tie[s].splice(ti, 1);
            }
            if (sel.end + 1 < tie.length) {
                const nt = tie[sel.end + 1].indexOf(sel.voice);
                if (nt >= 0) tie[sel.end + 1].splice(nt, 1);
            }
        });
        this.seqTouched = true;
        this.setLiveSeqPattern(pattern, tie);
        this.seqSelections = [];
        this.renderSequencer();
    }

    // Étire (delta > 0) ou raccourcit (delta < 0) la note sélectionnée d'une croche, depuis sa fin.
    // N'agit que si UNE SEULE note est sélectionnée (resize au clavier ambigu à plusieurs) ;
    // pour redimensionner depuis le DÉBUT ou avec plusieurs notes, utiliser les poignées de la souris/du doigt.
    resizeSelectedSeqNote(delta) {
        if (this.seqSelections.length !== 1) return;
        const sel = this.seqSelections[0];
        const chord = this.readChord();
        const { pattern, tie } = this.getLiveSeqPattern(chord);
        const steps = pattern.length;

        if (delta > 0) {
            const next = sel.end + 1;
            if (next >= steps || pattern[next].includes(sel.voice)) return; // bord de grille, ou déjà occupé
            pattern[next].push(sel.voice);
            tie[next].push(sel.voice); // prolonge la même note tenue
            sel.end = next;
        } else {
            if (sel.end <= sel.start) return; // une seule croche : Suppr pour l'effacer entièrement
            const last = sel.end;
            pattern[last].splice(pattern[last].indexOf(sel.voice), 1);
            const ti = tie[last].indexOf(sel.voice);
            if (ti >= 0) tie[last].splice(ti, 1);
            sel.end = last - 1;
        }

        this.seqTouched = true;
        this.setLiveSeqPattern(pattern, tie);
        this.renderSequencer();
    }

    // Bouton dédié dans le volet Lecture : ouvre/ferme le panneau, indépendamment du style choisi
    toggleSequencer() {
        this.seqOpen = !this.seqOpen;
        if (!this.seqOpen) this.seqSelections = [];
        document.getElementById('toggle-sequencer').classList.toggle('active', this.seqOpen);
        this.renderSequencer();
        this.updateGlobalUndoRedoButtons(); // le bouton unique repointe vers l'historique du séquenceur
    }

    // Menu contextuel d'un accord de la grille (« Séquenceur ») : le charge dans le panneau Accord
    // (comme Modifier) ET ouvre directement le séquenceur en grand, pour éviter l'aller-retour
    // modifier-puis-ouvrir-le-panneau quand on veut juste peaufiner son rythme.
    openSequencerFor(section, index) {
        this.editChord(section, index);
        this.seqOpen = true;
        document.getElementById('toggle-sequencer').classList.add('active');
        this.renderSequencer();
        this.updateGlobalUndoRedoButtons();
        document.getElementById('arp-sequencer').scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    renderSequencer() {
        const chord = this.syncSeqPatternForCurrentChord();
        const host = document.getElementById('arp-sequencer');
        if (!host) return;
        host.hidden = !this.seqOpen;
        if (!this.seqOpen) return;

        const midis = chord.getSeqMidiNotes();
        const noteNames = chord.getSeqDisplayNotes(this.useFlatsForRoot(chord.root));
        const roleMap = chord.getRoleMap(); // même code couleur que le clavier : fondamentale/tierce/quinte/7e/extensions
        const voices = midis.length;
        const steps = chord.beats * SEQ_STEPS_PER_BEAT;
        const { pattern, tie } = this.getLiveSeqPattern(chord);

        // Ordre d'AFFICHAGE des lignes (la plus aiguë en haut, comme un piano-roll), à ne jamais
        // confondre avec l'index de voix `r` (identité stable utilisée par le motif/pattern — voir
        // getSeqMidiNotes) : la basse, si présente, garde toujours le DERNIER index mais doit
        // s'afficher tout en BAS, pas en haut — d'où ce tri séparé, purement visuel.
        const rowOrder = Array.from({ length: voices }, (_, i) => i).sort((a, b) => midis[b] - midis[a]);

        // Un accord qui dure plusieurs mesures ne montre qu'une « page » à la fois (une mesure en
        // 4/4, deux en 2/4, une seule dès que la mesure est plus longue que 4 temps — voir
        // seqPageBars) plutôt que tout défiler d'un coup : sur mobile, un glissé pour étirer une
        // note se confondait avec le geste de scroll natif du navigateur. Naviguer d'une page à
        // l'autre se fait par un vrai saut (boutons ‹ ›), jamais par un scroll continu qui pourrait
        // à nouveau entrer en conflit avec l'étirement.
        const beatsPerBar = this.beatsPerBar();
        const stepsPerBar = beatsPerBar * SEQ_STEPS_PER_BEAT;
        const stepsPerPage = seqPageBars(beatsPerBar) * stepsPerBar;
        const totalPages = Math.max(1, Math.ceil(steps / stepsPerPage));
        this.seqPage = Math.min(Math.max(0, this.seqPage), totalPages - 1);
        const pageStart = this.seqPage * stepsPerPage;
        const pageEnd = Math.min(steps, pageStart + stepsPerPage);
        const pageSteps = pageEnd - pageStart;

        // La colonne des noms de voix (max-content) se resserre à la largeur réelle du texte affiché
        // (ex. "C3", "F#3") au lieu d'une largeur fixe généreuse qui laissait un vide à gauche.
        // Colonnes de pas en 1fr PUR, sans largeur plancher (contrairement à avant la pagination) :
        // une page doit TOUJOURS tenir sans le moindre débordement horizontal, quelle que soit la
        // largeur d'écran — un plancher, même modeste, suffisait à forcer un débordement (et donc un
        // vrai scroll tactile) sur les téléphones étroits pour une simple mesure en 4/4, ce qui
        // recréait exactement le conflit scroll/étirement que la pagination visait à éliminer.
        // data-page-start/steps : lus par updateSeqPlayhead pour savoir si le pas en cours de lecture
        // tombe dans la page affichée (et à quelle colonne), sans dupliquer ce calcul côté lecture.
        let html = `<div class="seq-scroll"><div class="seq-grid" data-page-start="${pageStart}" data-page-steps="${pageSteps}" style="grid-template-columns: max-content repeat(${pageSteps}, 1fr);">`;

        // Cases de la grille : zones de clic/glisser (toujours présentes, sous les notes visuelles).
        // Placement explicite (grid-row/grid-column) sur TOUT le monde : les notes ci-dessous se
        // superposent volontairement aux cases, et le placement automatique de la grille CSS
        // évite les zones déjà occupées par un élément placé explicitement — sans ça, les cases
        // se retrouveraient décalées pour « fuir » les notes au lieu de rester dessous.
        // Chaque paire de cases (double-croches s pair/impair) partage visuellement le même
        // rectangle qu'avant (voir .seq-cell-a/.seq-cell-b dans le CSS) : la résolution de clic/
        // glisser est fine, mais rien ne change à l'œil tant qu'une note n'utilise pas cette finesse.
        // `data-step` garde l'indice ABSOLU (pas relatif à la page) : le glissé/étirement (voir
        // onSeqPointerDown et findSeqStepAt, qui ne connaissent que les cases réellement dans le
        // DOM, donc celles de la page affichée) continue de raisonner sur le motif complet.
        let rowIndex = 0;
        for (const r of rowOrder) {
            rowIndex++;
            html += `<div class="seq-label" style="grid-row:${rowIndex}; grid-column:1;">${noteNames[r]}</div>`;
            for (let s = pageStart; s < pageEnd; s++) {
                const col = s - pageStart;
                const beatStart = (s % SEQ_STEPS_PER_BEAT === 0) ? ' beat-start' : '';
                const pairCls = (s % 2 === 0) ? ' seq-cell-a' : ' seq-cell-b';
                // Croche au début ou à la fin d'une note : indice visuel discret (curseur) qu'un
                // glissé depuis là peut étirer/raccourcir la note (pas de poignée visible séparée).
                // Se base sur le motif COMPLET (pas la page) : une note qui continue sur la page
                // suivante n'affiche jamais ce curseur à la coupure, seul son vrai bord le fait.
                const isEdge = pattern[s].includes(r) && (
                    !(s > 0 && pattern[s - 1].includes(r) && tie[s].includes(r)) ||
                    !(s + 1 < steps && pattern[s + 1].includes(r) && tie[s + 1].includes(r))
                );
                const edgeCls = isEdge ? ' seq-cell-edge' : '';
                const onCls = pattern[s].includes(r) ? ' on' : '';
                html += `<div class="seq-cell${pairCls}${beatStart}${edgeCls}${onCls}" data-step="${s}" data-voice="${r}" style="grid-row:${rowIndex}; grid-column:${col + 2};"></div>`;
            }
        }

        // Notes posées par-dessus : les croches actives et LIÉES d'une même voix ne forment qu'un
        // seul bloc (pilule si étiré au glissé, petit carré si une seule croche isolée) — deux notes
        // adjacentes mais non liées (deux taps séparés) restent deux blocs bien distincts.
        // Chaque note reste purement visuelle (pointer-events:none) : c'est la case en dessous qui
        // gère le clic. Un glissé démarré sur sa première ou dernière croche l'étire/la raccourcit
        // depuis ce bord (voir onSeqPointerDown) ; ailleurs, un glissé peint/efface comme avant.
        let notesHtml = '';
        rowIndex = 0;
        for (const r of rowOrder) {
            rowIndex++;
            let s = pageStart;
            while (s < pageEnd) {
                if (!pattern[s].includes(r)) { s++; continue; }
                const runStart = s;
                // Une note déjà en cours dès le premier pas visible de la page (liée à la croche
                // précédente, hors champ) est affichée « coupée » à ce bord plutôt que ronde, pour ne
                // pas laisser croire qu'elle commence ici (voir .seq-note.clip-start).
                const clipStart = (runStart === pageStart) && runStart > 0
                    && pattern[runStart - 1].includes(r) && tie[runStart].includes(r);
                s++;
                while (s < steps && pattern[s].includes(r) && tie[s].includes(r)) s++;
                const trueRunEnd = s - 1;
                // Idem à l'autre bout : la note continue au-delà de la page affichée -> coupée aussi
                // (voir .seq-note.clip-end), et le rendu s'arrête au dernier pas visible.
                const runEnd = Math.min(trueRunEnd, pageEnd - 1);
                const clipEnd = trueRunEnd > runEnd;
                s = runEnd + 1;
                const runLen = runEnd - runStart + 1;
                const shape = runLen > 1 ? 'run' : 'single';
                const role = roleMap[midis[r]] || 'ext';
                const isSelected = this.seqSelections.some(sel => sel.voice === r && sel.start === runStart);
                const sel = isSelected ? ' selected' : '';
                const clipCls = (clipStart ? ' clip-start' : '') + (clipEnd ? ' clip-end' : '');
                // Si la note finit sur la 2e moitié d'un rectangle (voir .seq-cell-b), la case de
                // fond s'arrête 4px avant le bord de la piste (son margin-right) pour laisser le
                // vrai espacement avant la paire suivante — sans ce même retrait, la pilule (qui
                // occupe toute la piste) dépasserait légèrement de ce rectangle de fond. Pas de
                // retrait si la note est coupée par la page : elle doit occuper toute la largeur.
                const trimEnd = (!clipEnd && runEnd % 2 === 1) ? ' margin-right:4px;' : '';
                // Petit repère à l'attaque (le tout début de la pilule, là où la note est réellement
                // pincée) pour la distinguer de sa partie tenue — seulement sur une vraie note (pas une
                // croche isolée, rien à distinguer) dont le début est réellement visible sur cette page
                // (une note coupée par la page — voir clip-start — n'attaque pas ici, juste continue).
                const headEl = (shape === 'run' && !clipStart) ? '<span class="seq-note-head"></span>' : '';
                notesHtml += `<div class="seq-note ${shape} role-${role}${sel}${clipCls}" data-voice="${r}" data-start="${runStart}" data-end="${trueRunEnd}" style="grid-row:${rowIndex}; grid-column:${runStart - pageStart + 2} / span ${runLen};${trimEnd}">${headEl}</div>`;
            }
        }
        html += notesHtml;

        // Numéros de temps en petit sous la grille (1, 2, 3... à chaque début de temps, recommence à
        // 1 à chaque mesure) : pour repérer d'un coup d'œil où tombe chaque temps, comme les numéros
        // de mesure sous la grille d'accords principale.
        const beatRow = voices + 1;
        let beatLabelsHtml = '';
        for (let s = pageStart; s < pageEnd; s += SEQ_STEPS_PER_BEAT) {
            const beatNum = (Math.floor(s / SEQ_STEPS_PER_BEAT) % beatsPerBar) + 1;
            beatLabelsHtml += `<div class="seq-beat-label" style="grid-row:${beatRow}; grid-column:${s - pageStart + 2};">${beatNum}</div>`;
        }
        html += beatLabelsHtml;

        // Curseur de lecture (masqué par défaut, positionné/affiché par updateSeqPlayhead pendant la
        // lecture) : ne couvre que les rangées de voix, pas celle des numéros de temps en dessous.
        html += `<div class="seq-playhead" style="grid-row: 1 / span ${voices}; grid-column: 2 / span 1;"></div>`;

        html += `</div></div>`;

        // Navigation par page (uniquement si l'accord déborde d'une page) : un vrai saut, jamais du
        // scroll continu — voir le commentaire plus haut sur le conflit avec l'étirement tactile.
        if (totalPages > 1) {
            const barsPerPage = seqPageBars(beatsPerBar);
            const totalBars = Math.ceil(steps / stepsPerBar);
            const firstBar = this.seqPage * barsPerPage + 1;
            const lastBar = Math.min(totalBars, firstBar + barsPerPage - 1);
            const label = (firstBar === lastBar) ? `Mesure ${firstBar} / ${totalBars}` : `Mesures ${firstBar}-${lastBar} / ${totalBars}`;
            html += `<div class="seq-page-nav">
                <button type="button" id="seq-page-prev" class="icon-btn" ${this.seqPage === 0 ? 'disabled' : ''} title="Mesure précédente" aria-label="Mesure précédente">${svgIcon('chevron-left')}</button>
                <span class="seq-page-label">${label}</span>
                <button type="button" id="seq-page-next" class="icon-btn" ${this.seqPage === totalPages - 1 ? 'disabled' : ''} title="Mesure suivante" aria-label="Mesure suivante">${svgIcon('chevron-right')}</button>
            </div>`;
        }
        // Les préréglages rythmiques (Tenu, Noire...) se choisissent désormais uniquement via le
        // menu déroulant Lecture ; cette rangée ne garde que l'écoute directe et le nettoyage.
        const hasSelection = this.seqSelections.length > 0;
        const countSuffix = this.seqSelections.length > 1 ? ` (${this.seqSelections.length})` : '';
        html += `<div class="seq-presets">
            <button type="button" id="seq-play" class="btn-prog">${svgIcon('play')} Lecture</button>
            <button type="button" id="seq-loop-play" class="icon-btn${this.seqLoopPlay ? ' active' : ''}" title="Rejouer en boucle" aria-label="Rejouer en boucle">${svgIcon('loop')}</button>
            <button type="button" id="seq-stop" class="btn-stop">${svgIcon('stop')} Stop</button>
            <button type="button" data-preset="clear" class="seq-delete-btn">${svgIcon('trash')} tout</button>
            <button type="button" id="seq-delete-selection" class="seq-delete-btn" ${hasSelection ? '' : 'disabled'}>${svgIcon('trash')}
                <span class="lbl-full">sélection${countSuffix}</span><span class="lbl-short">Sélect.${countSuffix}</span>
            </button>
        </div>`;
        host.innerHTML = html;

        // Bouton « X tout » (remplace tout le motif par du silence) : ciblé via [data-preset] pour
        // ne pas capturer « X sélection » ci-dessous, qui a son propre câblage.
        host.querySelectorAll('.seq-presets button[data-preset]').forEach(btn => {
            btn.onclick = () => {
                this.pushSeqUndo();
                this.seqTouched = true;
                this.seqSelections = [];
                const { pattern: p, tie: t } = seqPreset(btn.dataset.preset, voices, steps);
                this.setLiveSeqPattern(p, t);
                this.renderSequencer();
            };
        });

        const delBtn = document.getElementById('seq-delete-selection');
        if (delBtn) delBtn.onclick = () => this.deleteSelectedSeqNote();

        const playBtn = document.getElementById('seq-play');
        if (playBtn) playBtn.onclick = () => this.playCurrent();
        const stopBtn = document.getElementById('seq-stop');
        if (stopBtn) stopBtn.onclick = () => this.stopAll();
        const loopBtn = document.getElementById('seq-loop-play');
        if (loopBtn) loopBtn.onclick = (e) => {
            this.seqLoopPlay = !this.seqLoopPlay;
            e.currentTarget.classList.toggle('active', this.seqLoopPlay);
        };

        // Navigation par page : saut direct d'une mesure (ou groupe de mesures) à l'autre, jamais de
        // scroll continu (voir le commentaire plus haut sur le conflit avec l'étirement tactile).
        const prevBtn = document.getElementById('seq-page-prev');
        if (prevBtn) prevBtn.onclick = () => { this.seqPage--; this.renderSequencer(); };
        const nextBtn = document.getElementById('seq-page-next');
        if (nextBtn) nextBtn.onclick = () => { this.seqPage++; this.renderSequencer(); };
    }

    // Déplace le curseur de lecture (petite ligne verticale) du séquenceur au pas `step` en cours ;
    // `null` le masque (arrêt, ou pas hors de la page affichée). Ne fait rien si le panneau est fermé
    // ou déjà démonté — la lecture continue même quand le séquenceur n'est pas ouvert (voir playCurrent).
    updateSeqPlayhead(step) {
        const host = document.getElementById('arp-sequencer');
        if (!host || host.hidden) return;
        const grid = host.querySelector('.seq-grid');
        const ph = host.querySelector('.seq-playhead');
        if (!grid || !ph) return;
        if (step == null) { ph.style.display = 'none'; return; }
        const pageStart = +grid.dataset.pageStart, pageSteps = +grid.dataset.pageSteps;
        if (step < pageStart || step >= pageStart + pageSteps) { ph.style.display = 'none'; return; }
        ph.style.display = 'block';
        ph.style.gridColumn = `${step - pageStart + 2} / span 1`;
    }

    // Clic sur une case : sélectionne (surbrillance) + écoute l'accord, sauf si l'utilisateur a
    // désactivé la lecture automatique à la sélection (Paramètres > Son) — l'accord reste alors
    // affiché (clavier/guitare) mais ne se joue pas.
    selectChord(section, index) {
        this.activeSection = section;
        this.selectedIndex = index;
        this.loadProgression(); // re-render pour afficher la surbrillance
        this.updateGridPlayhead(section, index); // la barre de lecture se pose à gauche de l'accord choisi
        this.playSavedChord(section, index, this.autoplaySelect);
    }

    async playSavedChord(section, index, play = true) {
        await Tone.start();
        this.stopAll();

        const sections = loadProgressionSections();
        const data = sections[section] && sections[section].chords[index];
        if (!data) return;

        const chord = new Chord(data.root, data.quality, beatsFromData(data), data.inversion, data.drop, octaveFromData(data), data.bass);
        const notes = chord.getSeqNotes();
        const midis = chord.getSeqMidiNotes();
        const roleMap = chord.getRoleMap();
        const useFlats = this.useFlatsForRoot(chord.root);

        // Affiche l'accord sélectionné dans le grand titre + cadre le clavier
        const disp = document.getElementById('current-chord-display');
        disp.innerHTML = `<span class="chord-title">${flatTight(chord.getLabel(useFlats))}</span><span class="chord-notes">${chordNotesHtml(chord, useFlats)}</span>`;
        this.ensurePianoWindow(midis);
        this.ensureGuitarDiagram(chord);
        this.updateViz(midis, roleMap);

        if (!play) return; // aperçu silencieux seulement : le clavier/la guitare restent affichés

        const bpm = parseInt(document.getElementById('bpm').value);
        const secPerBeat = 60 / bpm;
        const { pattern: seqPattern, tie: seqTie } = this.resolveSeqPatternForData(chord, data);
        this.schedulePlayback(notes, midis, seqPattern, seqTie, secPerBeat, 0.1, roleMap, data.instrument || 'piano', chord, false, { section, index });
        this.isPlaying = true;

        // Attend que l'instrument soit prêt avant de démarrer le transport (voir playCurrent)
        await waitForAudioReady();

        // En fin de lecture, on GARDE l'accord affiché sur le clavier (au lieu de l'effacer)
        Tone.Transport.schedule((t) => {
            Tone.Draw.schedule(() => {
                try {
                    this.ensurePianoWindow(midis); this.updateViz(midis, roleMap); this.ensureGuitarDiagram(chord);
                } catch (e) {
                    console.warn('Affichage de fin ignoré :', e.message);
                }
                this.isPlaying = false;
            }, t);
        }, 0.1 + (chord.beats * secPerBeat));

        Tone.Transport.start();
    }

    removeChord(section, index) {
        const sections = loadProgressionSections();
        const history = sections[section] && sections[section].chords;
        if (!history) return;
        this.pushUndo(sections);
        history.splice(index, 1);
        saveProgressionSections(sections);

        if (section === this.activeSection) {
            // Si on supprimait l'accord en cours d'édition, on quitte le mode édition
            if (this.editingIndex === index) {
                this.exitEditMode();
            } else if (this.editingIndex != null && this.editingIndex > index) {
                this.editingIndex--;
            }

            // Ajuste la sélection
            if (this.selectedIndex === index) this.selectedIndex = null;
            else if (this.selectedIndex != null && this.selectedIndex > index) this.selectedIndex--;
        }

        this.loadProgression();
    }

    // ---------- Annuler / Rétablir (undo/redo) ----------
    // Chaque appel qui modifie la grille (ajout, suppression, modification, déplacement,
    // copier-coller, parties) capture l'état AVANT mutation via pushUndo(), avant d'appeler
    // saveProgressionSections(). Toute nouvelle action après un undo efface la pile de redo.
    // Chaque entrée retient aussi la tonalité globale du moment (pas seulement les accords) : la
    // plupart des actions annulables ne la touchent pas (restauration = no-op sur ce point-là), mais
    // la transposition de tout le morceau (transposeSong) la modifie EN MÊME TEMPS que les accords —
    // sans ça, un Ctrl+Z après une transposition remettrait les accords dans l'ancienne tonalité tout
    // en laissant affichée la nouvelle, un état incohérent que l'utilisateur n'a jamais demandé.
    pushUndo(sections) {
        const root = document.getElementById('global-root').value;
        this.undoStack.push(JSON.stringify({ sections, root }));
        if (this.undoStack.length > this.undoLimit) this.undoStack.shift();
        this.redoStack = [];
        this.updateGlobalUndoRedoButtons();
    }

    // Restaure la tonalité globale mémorisée dans une entrée d'historique si elle diffère de
    // l'actuelle (no-op sinon) — voir le commentaire de pushUndo.
    restoreHistoryRoot(root) {
        const rootSel = document.getElementById('global-root');
        if (!root || root === rootSel.value) return;
        rootSel.value = root;
        hasUnsavedChanges = true;
        this.updateKeyLabels();
    }

    undo() {
        if (this.undoStack.length === 0) { this.flashHint('Rien à annuler'); return; }
        const current = { sections: loadProgressionSections(), root: document.getElementById('global-root').value };
        this.redoStack.push(JSON.stringify(current));
        const prev = JSON.parse(this.undoStack.pop());
        saveProgressionSections(prev.sections);
        this.restoreHistoryRoot(prev.root);
        this.afterHistoryRestore(prev.sections);
        this.flashHint('Annulé');
    }

    redo() {
        if (this.redoStack.length === 0) { this.flashHint('Rien à rétablir'); return; }
        const current = { sections: loadProgressionSections(), root: document.getElementById('global-root').value };
        this.undoStack.push(JSON.stringify(current));
        const next = JSON.parse(this.redoStack.pop());
        saveProgressionSections(next.sections);
        this.restoreHistoryRoot(next.root);
        this.afterHistoryRestore(next.sections);
        this.flashHint('Rétabli');
    }

    // Après un undo/redo : les indices de sélection/édition ne correspondent plus forcément
    // à l'état restauré, donc on les réinitialise prudemment plutôt que de risquer un décalage.
    afterHistoryRestore(sections) {
        if (this.editingIndex != null) this.exitEditMode();
        if (this.activeSection >= sections.length) this.activeSection = Math.max(0, sections.length - 1);
        this.selectedIndex = null;
        this.loadProgression();
        this.updateGlobalUndoRedoButtons();
    }

    // Un seul bouton annuler/rétablir tout en haut pour les 3 historiques (grille, séquenceur,
    // fichiers) plutôt qu'une paire dupliquée dans chaque carte — bascule sur le bon exactement comme
    // Ctrl+Z/Ctrl+Y (voir setupKeyboardShortcuts) : fenêtre Fichiers ouverte > séquenceur ouvert >
    // grille par défaut.
    globalUndo() {
        if (this.settingsOpen) this.filesUndo();
        else if (this.seqOpen) this.seqUndo();
        else this.undo();
    }

    globalRedo() {
        if (this.settingsOpen) this.filesRedo();
        else if (this.seqOpen) this.seqRedo();
        else this.redo();
    }

    // Reflète l'historique du contexte actuellement actif (voir globalUndo ci-dessus) sur le bouton
    // unique — à appeler à chaque push/undo/redo des 3 historiques ET à chaque changement de contexte
    // (ouverture/fermeture Fichiers ou séquenceur), puisque le bouton doit re-pointer vers un autre
    // historique sans qu'aucune pile n'ait elle-même changé.
    updateGlobalUndoRedoButtons() {
        const undoBtn = document.getElementById('global-undo-btn');
        const redoBtn = document.getElementById('global-redo-btn');
        if (!undoBtn || !redoBtn) return;
        let undoStack, redoStack;
        if (this.settingsOpen) { undoStack = this.filesUndoStack; redoStack = this.filesRedoStack; }
        else if (this.seqOpen) { undoStack = this.seqUndoStack; redoStack = this.seqRedoStack; }
        else { undoStack = this.undoStack; redoStack = this.redoStack; }
        undoBtn.disabled = undoStack.length === 0;
        redoBtn.disabled = redoStack.length === 0;
    }

    // Vide l'historique annuler/rétablir (appelé lors d'un changement de morceau : undo/redo
    // ne doit pas traverser deux morceaux différents)
    clearHistory() {
        this.undoStack = [];
        this.redoStack = [];
        this.updateGlobalUndoRedoButtons();
    }

    // ---------- Annuler / Rétablir dans le séquenceur ----------
    // Historique SÉPARÉ de celui de la grille d'accords : il porte sur le motif de l'accord en cours
    // d'édition (l'input caché #arpPattern), pas encore « Ajouté »/« Modifié » dans la progression.
    // Une simple chaîne suffit comme instantané, puisque c'est déjà la représentation complète du motif.
    pushSeqUndo() {
        this.seqUndoStack.push(document.getElementById('arpPattern').value);
        if (this.seqUndoStack.length > this.undoLimit) this.seqUndoStack.shift();
        this.seqRedoStack = [];
        this.updateGlobalUndoRedoButtons();
    }

    seqUndo() {
        if (this.seqUndoStack.length === 0) { this.flashHint('Rien à annuler dans le séquenceur'); return; }
        this.seqRedoStack.push(document.getElementById('arpPattern').value);
        document.getElementById('arpPattern').value = this.seqUndoStack.pop();
        this.seqTouched = true;
        this.seqSelections = [];
        this.renderSequencer();
        this.updateGlobalUndoRedoButtons();
        this.flashHint('Annulé');
    }

    seqRedo() {
        if (this.seqRedoStack.length === 0) { this.flashHint('Rien à rétablir dans le séquenceur'); return; }
        this.seqUndoStack.push(document.getElementById('arpPattern').value);
        document.getElementById('arpPattern').value = this.seqRedoStack.pop();
        this.seqTouched = true;
        this.seqSelections = [];
        this.renderSequencer();
        this.updateGlobalUndoRedoButtons();
        this.flashHint('Rétabli');
    }


    // Vide l'historique du séquenceur (nouvel accord chargé, réglages changés, ou motif enregistré
    // dans la grille : l'historique d'un accord n'a plus de sens pour un autre)
    clearSeqHistory() {
        this.seqUndoStack = [];
        this.seqRedoStack = [];
        this.updateGlobalUndoRedoButtons();
    }

    // ---------- Raccourcis clavier ----------
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            const tag = (document.activeElement && document.activeElement.tagName) || '';
            const typing = ['INPUT', 'SELECT', 'TEXTAREA'].includes(tag)
                || (document.activeElement && document.activeElement.isContentEditable);
            const mod = e.ctrlKey || e.metaKey;

            if (e.key === 'Escape' && !document.getElementById('context-menu').hidden) { this.closeContextMenu(); return; }
            if (e.key === 'Escape' && !document.getElementById('section-picker-menu').hidden) { this.closeSectionPicker(); return; }
            if (e.key === 'Escape' && !document.getElementById('duration-dd-menu').hidden) { this.closeDurationMenu(); return; }
            if (e.key === 'Escape' && !document.getElementById('playstyle-dd-menu').hidden) { this.closePlayStyleMenu(); return; }
            if (e.key === 'Escape' && this.settingsOpen) { this.closeSettings(); return; }

            // Barre d'espace : joue/stoppe l'accord courant si le séquenceur est ouvert (pour
            // itérer vite dessus sans la souris), sinon la progression entière. Volontairement PAS
            // exclu quand un bouton a le focus (ex. juste après un clic sur un préréglage du
            // séquenceur) : sinon l'espace réactive ce bouton au lieu de jouer/stopper.
            if ((e.key === ' ' || e.code === 'Space') && !typing && !mod) {
                e.preventDefault();
                if (this.isPlaying) this.stopAll();
                else if (this.seqOpen) this.playCurrent();
                else this.playProgression();
                return;
            }

            if (mod && (e.key === 'c' || e.key === 'C')) {
                if (!typing && this.selectedIndex != null) { this.copySelected(); e.preventDefault(); }
                return;
            }
            if (mod && (e.key === 'v' || e.key === 'V')) {
                if (!typing && this.clipboard) { this.pasteChord(); e.preventDefault(); }
                return;
            }
            // Annuler / Rétablir : Ctrl/Cmd+Z (annuler), Ctrl/Cmd+Y ou Ctrl/Cmd+Shift+Z (rétablir).
            // Trois historiques distincts, chacun actif seulement dans son propre contexte visible :
            // fenêtre Fichiers ouverte > séquenceur ouvert > grille d'accords par défaut.
            if (mod && !typing && (e.key === 'z' || e.key === 'Z')) {
                e.preventDefault();
                if (this.settingsOpen) { if (e.shiftKey) this.filesRedo(); else this.filesUndo(); }
                else if (this.seqOpen) { if (e.shiftKey) this.seqRedo(); else this.seqUndo(); }
                else { if (e.shiftKey) this.redo(); else this.undo(); }
                return;
            }
            if (mod && !typing && (e.key === 'y' || e.key === 'Y')) {
                e.preventDefault();
                if (this.settingsOpen) this.filesRedo();
                else if (this.seqOpen) this.seqRedo();
                else this.redo();
                return;
            }
            // Ctrl/Cmd+S : enregistre réellement le morceau (voir saveCurrentSong) — au lieu du
            // dialogue natif « Enregistrer la page », partout (même en train de taper un champ).
            if (mod && (e.key === 's' || e.key === 'S')) {
                e.preventDefault();
                this.saveCurrentSong();
                return;
            }
            // Note du séquenceur sélectionnée : Suppr/Retour l'efface, ← → la raccourcit/rallonge
            // (prioritaire sur la sélection de la grille d'accords, plus locale à l'édition en cours)
            if (!typing && this.seqSelections.length > 0) {
                if (e.key === 'Delete' || e.key === 'Backspace') { this.deleteSelectedSeqNote(); e.preventDefault(); return; }
                if (e.key === 'ArrowRight') { this.resizeSelectedSeqNote(1); e.preventDefault(); return; }
                if (e.key === 'ArrowLeft') { this.resizeSelectedSeqNote(-1); e.preventDefault(); return; }
            }

            // Accord sélectionné dans la grille : ← → passe au précédent/suivant DANS LA MÊME PARTIE
            // (s'arrête aux bornes, ne saute pas d'une partie à l'autre) — s'appuie sur selectChord,
            // donc rejoue aussi l'accord ciblé, comme un clic direct sur sa case.
            if (!typing && this.selectedIndex != null && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
                const sections = loadProgressionSections();
                const history = sections[this.activeSection] && sections[this.activeSection].chords;
                if (history && history.length > 0) {
                    const dir = (e.key === 'ArrowRight') ? 1 : -1;
                    const next = Math.min(history.length - 1, Math.max(0, this.selectedIndex + dir));
                    if (next !== this.selectedIndex) this.selectChord(this.activeSection, next);
                    e.preventDefault();
                }
            }

            if (!typing && (e.key === 'Delete' || e.key === 'Backspace')) {
                if (this.selectedIndex != null) { this.removeChord(this.activeSection, this.selectedIndex); e.preventDefault(); }
            }

            // Entrée depuis un réglage d'accord : ajoute/modifie sans avoir à cliquer sur le bouton
            if (e.key === 'Enter' && CHORD_PARAM_IDS.includes(document.activeElement && document.activeElement.id)) {
                e.preventDefault();
                this.saveCurrent();
            }
        });
    }

    // ---------- Copier / coller / dupliquer (au sein de la partie active) ----------
    copySelected() {
        const sections = loadProgressionSections();
        const history = sections[this.activeSection].chords;
        if (this.selectedIndex == null || !history[this.selectedIndex]) return;
        this.clipboard = { ...history[this.selectedIndex] };
        this.flashHint('Accord copié — Ctrl/Cmd+V pour coller');
    }

    pasteChord() {
        if (!this.clipboard) return;
        const sections = loadProgressionSections();
        this.pushUndo(sections);
        const history = sections[this.activeSection].chords;
        const at = (this.selectedIndex != null) ? this.selectedIndex + 1 : history.length;
        history.splice(at, 0, { ...this.clipboard });
        saveProgressionSections(sections);
        if (this.editingIndex != null && this.editingIndex >= at) this.editingIndex++;
        this.selectedIndex = at; // sélectionne l'accord collé
        this.loadProgression();
        this.flashHint('Accord collé');
    }

    // Duplique un accord donné (bouton ⧉) : la copie se place juste après, dans la même partie
    duplicateChord(section, index) {
        const sections = loadProgressionSections();
        const history = sections[section] && sections[section].chords;
        if (!history || !history[index]) return;
        this.pushUndo(sections);
        history.splice(index + 1, 0, { ...history[index] });
        saveProgressionSections(sections);
        this.activeSection = section;
        if (this.editingIndex != null && this.editingIndex > index) this.editingIndex++;
        this.selectedIndex = index + 1; // sélectionne la copie
        this.loadProgression();
    }

    // Monte/descend l'octave d'un accord d'un cran (menu contextuel, voir data-ctx-action="octave-*")
    // sans ouvrir le mode édition complet — plafonné aux mêmes bornes que le sélecteur Octave du
    // panneau Accord (2 à 5). Si c'est l'accord actuellement en édition, resynchronise le panneau
    // (et le séquenceur) avec la nouvelle octave plutôt que de le laisser périmé.
    changeChordOctave(section, index, delta) {
        const sections = loadProgressionSections();
        const data = sections[section] && sections[section].chords[index];
        if (!data) return;
        const current = octaveFromData(data);
        const next = Math.max(2, Math.min(5, current + delta));
        if (next === current) {
            this.flashHint(delta > 0 ? 'Déjà à l’octave la plus haute (5)' : 'Déjà à l’octave la plus basse (2)');
            return;
        }
        this.pushUndo(sections);
        data.octave = next;
        saveProgressionSections(sections);
        hasUnsavedChanges = true;
        if (this.editingIndex === index && this.activeSection === section) this.editChord(section, index);
        else this.loadProgression();
        this.flashHint(`Octave ${next}`);
    }

    // Petit message éphémère (toast)
    flashHint(msg, duration = 1600) {
        let t = document.getElementById('toast');
        if (!t) {
            t = document.createElement('div');
            t.id = 'toast';
            t.className = 'toast';
            document.body.appendChild(t);
        }
        t.textContent = msg;
        t.classList.add('show');
        clearTimeout(this._toastTimer);
        this._toastTimer = setTimeout(() => t.classList.remove('show'), duration);
    }
}

window.app = new HarmoHubApp();
