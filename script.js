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
    add9: 'add9', maj9: 'maj9', m9: 'm9', dom9: '9', dom11: '11', dom13: '13'
};

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

// Réglages d'accord : Entrée depuis l'un d'eux ajoute/modifie directement (moins de clics)
const CHORD_PARAM_IDS = ['root', 'quality', 'duration', 'inversion', 'drop', 'octave', 'bass', 'playStyle', 'instrument'];

// Récupère la durée en temps d'un accord sauvegardé (compatibilité : anciens formats en "measures")
function beatsFromData(data) {
    if (data.beats != null) return parseInt(data.beats);
    if (data.measures != null) return (parseInt(data.measures) || 1) * 4; // ancien format
    return 4;
}

// Octave de base d'un accord (défaut 3 = C3, compatibilité avec les sauvegardes sans octave)
function octaveFromData(data) {
    return (data.octave != null) ? parseInt(data.octave) : 3;
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

function saveProgressionSections(sections) {
    localStorage.setItem('myProgression', JSON.stringify({ sections }));
    syncCurrentSong({ sections });
}

// ---------- Morceaux (plusieurs chansons enregistrées séparément) ----------
// Le « tampon de travail » (myProgression, tonalité, tempo) représente toujours le morceau ouvert.
// Tant qu'un morceau est ouvert (SONG_ID_KEY renseigné), chaque modification s'y recopie aussitôt :
// il n'y a rien à « enregistrer » à part la toute première fois (lui donner un nom).
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

// Ajuste un motif à la durée/voix courantes : tronque ou complète par du silence, retire les
// voix devenues hors plage (ex. accord passé de tétrade à triade). Préserve le reste tel quel.
function resizeSeqPattern(pattern, tie, steps, voices) {
    const outP = [], outT = [];
    for (let i = 0; i < steps; i++) {
        const v = (pattern[i] || []).filter(x => x >= 0 && x < voices);
        outP.push(v);
        outT.push((tie[i] || []).filter(x => v.includes(x)));
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
    // travers renversements et drops
    getVoiced() {
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

        return voiced.sort((a, b) => a.midi - b.midi);
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
const INSTRUMENT_KEY = 'harmoboxInstrument';
const METRONOME_KEY = 'harmoboxMetronomeDuringPlayback';
const CHORD_VOLUME_KEY = 'harmoboxChordVolume';
const METRONOME_VOLUME_KEY = 'harmoboxMetronomeVolume';
const METRONOME_SOUND_KEY = 'harmoboxMetronomeSound';
const GENERAL_VOLUME_KEY = 'harmoboxGeneralVolume';

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
const METRONOME_SOUNDS = {
    click: {
        label: 'Clic classique',
        build: () => new Tone.Synth({
            oscillator: { type: 'triangle' },
            envelope: { attack: 0.001, decay: 0.04, sustain: 0, release: 0.02 }
        }),
        trigger: (inst, accent, time) => inst.triggerAttackRelease(accent ? 1500 : 1000, 0.03, time)
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
        trigger: (inst, accent, time) => {
            inst._filter.frequency.setValueAtTime(accent ? 1100 : 780, time);
            inst.triggerAttackRelease(0.05, time, accent ? 0.95 : 0.65);
        }
    },
    clave: {
        label: 'Clave',
        build: () => new Tone.MetalSynth({
            envelope: { attack: 0.001, decay: 0.03, release: 0.01 },
            harmonicity: 3.1, modulationIndex: 16, resonance: 3500, octaves: 0.5
        }),
        trigger: (inst, accent, time) => inst.triggerAttackRelease(accent ? 'C7' : 'G6', 0.02, time)
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
        trigger: (inst, accent, time) => inst.triggerAttackRelease(accent ? 'C6' : 'A5', 0.4, time, accent ? 0.55 : 0.4)
    },
    tic: {
        label: 'Tic sec',
        build: () => new Tone.NoiseSynth({
            noise: { type: 'white' },
            envelope: { attack: 0.0005, decay: 0.025, sustain: 0 }
        }),
        // Le bruit blanc n'a pas de hauteur : l'accent se distingue par le volume (vélocité) plutôt
        // que par la note.
        trigger: (inst, accent, time) => inst.triggerAttackRelease(0.03, time, accent ? 1 : 0.55)
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

class HarmoBoxApp {
    constructor() {
        // Volume général : agit APRÈS les deux réglages spécifiques ci-dessous (accords, métronome),
        // sur la sortie audio globale de Tone.js — un vrai « volume maître » qui les multiplie tous
        // les deux ensemble sans changer leur équilibre relatif l'un par rapport à l'autre.
        const storedGeneralVol = localStorage.getItem(GENERAL_VOLUME_KEY);
        this.generalVolumePercent = storedGeneralVol !== null ? parseInt(storedGeneralVol) : 100;
        Tone.Destination.volume.value = percentToDb(this.generalVolumePercent);

        // Chaque accord choisit sa propre banque de son (voir data.instrument) : plusieurs
        // instruments Tone.js peuvent donc jouer simultanément. Construits à la demande et mis en
        // cache (voir getInstrument) plutôt qu'un seul « activeInstrument » partagé comme avant.
        this.instrumentCache = new Map();

        // Volume des accords : un seul nœud partagé, entre CHAQUE instrument et la sortie, pour un
        // réglage global unique quelle que soit la banque de son choisie (voir getInstrument).
        // 100 par défaut = 0 dB de correction, exactement le volume d'avant l'ajout de ce réglage.
        const storedChordVol = localStorage.getItem(CHORD_VOLUME_KEY);
        this.chordVolumePercent = storedChordVol !== null ? parseInt(storedChordVol) : 100;
        this.chordVolumeNode = new Tone.Volume(percentToDb(this.chordVolumePercent)).toDestination();

        // Métronome : son au choix (voir METRONOME_SOUNDS et le panneau Son des Paramètres). 80 par
        // défaut = -8 dB, le volume fixe d'avant l'ajout de ce réglage.
        const storedSound = localStorage.getItem(METRONOME_SOUND_KEY);
        this.metronomeSoundKey = (storedSound && METRONOME_SOUNDS[storedSound]) ? storedSound : 'click';
        this.metronome = METRONOME_SOUNDS[this.metronomeSoundKey].build().toDestination();
        const storedMetroVol = localStorage.getItem(METRONOME_VOLUME_KEY);
        this.metronomeVolumePercent = storedMetroVol !== null ? parseInt(storedMetroVol) : 80;
        this.metronome.volume.value = percentToDb(this.metronomeVolumePercent);

        this.activeSection = 0;    // partie (couplet/refrain/...) ciblée par les contrôles courants
        this.selectedIndex = null; // accord sélectionné dans la grille (au sein de la partie active)
        this.editingIndex = null;  // accord en cours de modification (au sein de la partie active)
        this.drag = null;          // état de glisser-déposer
        this.clipboard = null;     // presse-papier (copier/coller d'accords)
        this.pianoWindow = null;   // fenêtre clavier courante
        this._lastTap = null;      // pour le double-tap (suppression mobile)
        this.isPlaying = false;    // une lecture (accord/progression) est-elle en cours ?
        this.seqOpen = false;      // panneau séquenceur ouvert ou non (indépendant du style de lecture)
        this.seqTouched = false;   // l'utilisateur a-t-il personnalisé le motif pour l'accord en cours ?
        this.seqSelections = []; // notes du séquenceur sélectionnées : [{ voice, start, end }, ...]
        this.seqDrag = null;       // état de glisser en cours sur le séquenceur

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
        this.setupGridInteractions();
        this.setupSequencerInteractions();
        this.setupKeyboardShortcuts();
        this.updateKeyLabels();
        this.updateDurationOptions();
        this.loadProgression();
        this.refreshPreview();       // affiche l'accord courant + cadre le clavier dès l'ouverture
        this.renderSequencer();      // prépare le motif (masqué tant que le panneau n'est pas ouvert)
        this.refreshSongList();      // remplit le sélecteur de morceaux enregistrés
        this.updateUndoRedoButtons();
        this.updateSeqUndoRedoButtons();
    }

    setupEventListeners() {
        document.getElementById('play').onclick = () => this.playCurrent();
        document.getElementById('save').onclick = () => this.saveCurrent();
        document.getElementById('save-insert').onclick = () => this.saveCurrent(this.selectedIndex);
        document.getElementById('play-prog').onclick = () => this.playProgression();
        document.getElementById('stop').onclick = () => this.stopAll();

        document.getElementById('undo-btn').onclick = () => this.undo();
        document.getElementById('redo-btn').onclick = () => this.redo();

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

        // Révèle/masque les accords moins courants (diminués, augmentés, enrichis...) dans le
        // menu Qualité, sans les faire disparaître de la valeur déjà choisie si elle en fait partie.
        document.getElementById('toggle-complex-quality').onclick = (e) => {
            const btn = e.currentTarget;
            const show = !btn.classList.contains('active');
            document.querySelectorAll('#quality option.opt-complex').forEach(o => { o.hidden = !show; });
            btn.classList.toggle('active', show);
        };

        // Révèle/masque le sélecteur de basse différente (accord « sur » une note, ex. Cmaj7/D) : ne
        // remet jamais la valeur choisie à « Aucune » en masquant — juste le contrôle qui se range,
        // comme les accords/modes moins courants ci-dessus.
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
        document.getElementById('toggle-complex-mode').onclick = (e) => {
            const btn = e.currentTarget;
            const show = !btn.classList.contains('active');
            document.querySelectorAll('#global-mode option.opt-mode').forEach(o => { o.hidden = !show; });
            modeSelect.querySelector('option[value="maj"]').textContent = show ? 'Ionien' : 'Majeur';
            modeSelect.querySelector('option[value="min"]').textContent = show ? 'Éolien' : 'Mineur';
            btn.classList.toggle('active', show);
        };

        document.getElementById('bpm').oninput = (e) => document.getElementById('bpm-val').value = e.target.value;
        document.getElementById('bpm').addEventListener('change', (e) => syncCurrentSong({ bpm: parseInt(e.target.value) }));

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
            syncCurrentSong({ bpm: v });
        });

        document.getElementById('global-root').onchange = () => {
            syncCurrentSong({ root: document.getElementById('global-root').value });
            this.updateKeyLabels(); this.loadProgression(); this.refreshPreview();
        };
        document.getElementById('global-mode').onchange = () => {
            syncCurrentSong({ mode: document.getElementById('global-mode').value });
            this.updateKeyLabels(); this.loadProgression(); this.refreshPreview();
        };
        document.getElementById('time-sig').onchange = () => {
            syncCurrentSong({ timeSig: document.getElementById('time-sig').value });
            this.updateDurationOptions();
            this.loadProgression();
            this.refreshPreview();
            this.renderSequencer();
        };
        // Le groove ne change rien à l'affichage (la grille du séquenceur reste visuellement droite,
        // comme dans la plupart des séquenceurs/DAW : seul l'instant réel de chaque case se décale à
        // la lecture/l'export) — pas de re-rendu à déclencher ici, juste la sauvegarde du réglage.
        document.getElementById('groove').onchange = () => {
            syncCurrentSong({ groove: document.getElementById('groove').value });
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
            const { pattern, tie } = seqPreset(document.getElementById('playStyle').value, chord.getMidiNotes().length, chord.beats * SEQ_STEPS_PER_BEAT);
            this.setLiveSeqPattern(pattern, tie);
            this.renderSequencer();
            this.refreshPreview();
        };

        document.getElementById('toggle-sequencer').onclick = () => this.toggleSequencer();
        document.getElementById('seq-undo-btn').onclick = () => this.seqUndo();
        document.getElementById('seq-redo-btn').onclick = () => this.seqRedo();

        document.getElementById('cancel-edit').onclick = () => this.cancelEdit();

        document.getElementById('add-section').onclick = () => this.addSection();

        document.getElementById('song-select').onchange = (e) => this.onSongSelectChange(e.target.value);
        document.getElementById('song-new').onclick = () => this.newSong();
        document.getElementById('song-save').onclick = () => this.saveCurrentAsSong();

        // Fenêtre Paramètres : toutes les sections (Son, Fichiers) se rendent ensemble à l'ouverture,
        // en une seule vue qui défile, sans onglet.
        document.getElementById('open-settings').onclick = () => this.openSettings();
        document.getElementById('settings-close').onclick = () => this.closeSettings();
        document.getElementById('settings-overlay').addEventListener('click', (e) => {
            if (e.target.id === 'settings-overlay') this.closeSettings(); // clic sur le fond, pas la fenêtre
        });

        // Menu contextuel (clic droit / appui long) : Renommer / Supprimer, réutilisés pour les
        // morceaux et les dossiers (voir attachContextMenuTrigger, appelé depuis renderFilesPanel).
        document.querySelector('[data-ctx-action="rename"]').onclick = () => {
            const t = this.contextMenuTarget;
            this.closeContextMenu();
            if (!t) return;
            if (t.type === 'song') this.startInlineRenameSong(t.id);
            else if (t.type === 'folder') this.startInlineRenameFolder(t.name);
        };
        document.querySelector('[data-ctx-action="delete"]').onclick = () => {
            const t = this.contextMenuTarget;
            this.closeContextMenu();
            if (!t) return;
            if (t.type === 'song') this.deleteSongById(t.id);
            else if (t.type === 'folder') this.deleteFolder(t.name);
        };
        document.addEventListener('pointerdown', (e) => {
            const menu = document.getElementById('context-menu');
            if (!menu.hidden && !menu.contains(e.target)) this.closeContextMenu();
        });

        document.getElementById('export-pdf').onclick = () => this.exportPdf();
        document.getElementById('export-midi').onclick = () => this.exportMidi();
        document.getElementById('export-audio').onclick = () => this.exportAudio();
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

    stopAll() {
        Tone.Transport.stop();
        Tone.Transport.cancel();
        this.instrumentCache.forEach(inst => inst.releaseAll());
        this.clearViz();
        this.highlightPlaying(null, null);
        this.isPlaying = false;
    }

    // Instrument Tone.js pour cette banque, construit puis mis en cache au premier accord qui s'en
    // sert (plusieurs peuvent donc jouer en même temps, chaque accord ayant potentiellement la sienne).
    getInstrument(key) {
        if (!INSTRUMENT_BANKS[key]) key = 'piano';
        let inst = this.instrumentCache.get(key);
        if (!inst) {
            inst = INSTRUMENT_BANKS[key].build().connect(this.chordVolumeNode);
            this.instrumentCache.set(key, inst);
        }
        return inst;
    }

    // Joue un motif de séquenceur (résolution croche) : regroupe les cases actives contiguës d'une
    // même voix en une seule note tenue plutôt que de rejouer une attaque à chaque croche — c'est ce
    // qui permet à un motif « tout allumé » de sonner comme un accord soutenu (Maintenu), tout en
    // restant un motif éditable case par case comme un vrai séquenceur pas-à-pas.
    schedulePlayback(notes, midis, seqPattern, seqTie, secPerBeat, timeOffset, roleMap = {}, instrumentKey = 'piano') {
        const instrument = this.getInstrument(instrumentKey);
        const stepDur = secPerBeat / SEQ_STEPS_PER_BEAT;
        const steps = seqPattern.length;
        // Instant réel d'une case, groove pris en compte (voir GROOVE_RATIOS/grooveStepOffset) : la
        // grille elle-même ne change pas, seul cet instant se décale.
        const ratio = this.grooveRatio();
        const stepTime = (s) => timeOffset + grooveStepOffset(s, stepDur, ratio);

        // Surbrillance clavier : à chaque croche, affiche les voix actives à cet instant précis
        for (let s = 0; s < steps; s++) {
            const activeMidis = seqPattern[s].map(v => midis[v]);
            Tone.Transport.schedule((t) => {
                Tone.Draw.schedule(() => { this.ensurePianoWindow(midis); this.updateViz(activeMidis, roleMap); }, t);
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
                    instrument.triggerAttackRelease(notes[voice], dur, t + humanize, vel);
                }, t0);
            }
        }
    }

    async playCurrent() {
        await Tone.start();
        this.stopAll();

        const chord = this.readChord();
        const notes = chord.getNotes();
        this.refreshPreview();

        const { pattern: seqPattern, tie: seqTie } = this.getLiveSeqPattern(chord);
        const bpm = parseInt(document.getElementById('bpm').value);
        const secPerBeat = 60 / bpm;
        const instrumentKey = document.getElementById('instrument').value;

        this.schedulePlayback(notes, chord.getMidiNotes(), seqPattern, seqTie, secPerBeat, 0.1, chord.getRoleMap(), instrumentKey);
        this.isPlaying = true;

        Tone.Transport.schedule((t) => {
            Tone.Draw.schedule(() => { this.refreshPreview(); this.isPlaying = false; }, t); // ré-affiche l'accord complet en fin de lecture
        }, 0.1 + (chord.beats * secPerBeat));

        Tone.Transport.start();
    }

    // Joue la chanson en entier : toutes les parties (couplet, refrain, ...) mises bout à bout, dans
    // leur ordre d'affichage.
    async playProgression() {
        await Tone.start();
        this.stopAll();

        const sections = loadProgressionSections();
        const flat = []; // { section, index, data } à plat, dans l'ordre de lecture
        sections.forEach((sec, si) => sec.chords.forEach((data, ci) => flat.push({ section: si, index: ci, data })));
        if (flat.length === 0) return;

        // Démarre depuis l'accord en surbrillance si présent, sinon depuis le tout début
        let startPos = 0;
        if (this.selectedIndex != null) {
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
                this.playMetronomeClick(accent, t);
                Tone.Draw.schedule(() => {
                    disp.innerHTML = `Décompte<span class="chord-notes">${label} / ${COUNT_IN}</span>`;
                }, t);
            }, clickTime);
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
            const notes = chord.getNotes();
            const { pattern: seqPattern, tie: seqTie } = this.resolveSeqPatternForData(chord, data);
            this.schedulePlayback(notes, chord.getMidiNotes(), seqPattern, seqTie, secPerBeat, timeOffset, chord.getRoleMap(), data.instrument || 'piano');

            // Métronome maintenu pendant la lecture (option activée) : un clic par temps de l'accord,
            // accentué sur le 1er temps de chaque mesure — indépendant des notes de l'accord jouées.
            if (this.metronomeDuringPlayback) {
                for (let b = 0; b < chord.beats; b++) {
                    const accent = (songBeat % COUNT_IN === 0);
                    const clickTime = timeOffset + b * secPerBeat;
                    Tone.Transport.schedule((t) => {
                        this.playMetronomeClick(accent, t);
                    }, clickTime);
                    songBeat++;
                }
            }

            // Au début de cet accord : maj de l'indicateur (nom + notes) et surbrillance dans la grille
            const chordUseFlats = this.useFlatsForRoot(chord.root);
            const labelHTML = `<span class="chord-title">${flatTight(chord.getLabel(chordUseFlats))}</span><span class="chord-notes">${chordNotesHtml(chord, chordUseFlats)}</span>`;
            Tone.Transport.schedule((t) => {
                Tone.Draw.schedule(() => {
                    disp.innerHTML = labelHTML;
                    this.highlightPlaying(section, index);
                }, t);
            }, timeOffset);

            timeOffset += chord.beats * secPerBeat;
        });

        Tone.Transport.schedule((t) => {
            Tone.Draw.schedule(() => { this.clearViz(); this.highlightPlaying(null, null); this.isPlaying = false; }, t);
        }, timeOffset);

        Tone.Transport.start();
    }

    // Surbrillance de l'accord en cours de lecture (sans re-render de la grille)
    highlightPlaying(section, index) {
        document.querySelectorAll('.grid-cell.playing').forEach(c => c.classList.remove('playing'));
        if (index == null) return;
        document.querySelectorAll(`.chord-grid[data-section="${section}"] .grid-cell[data-index="${index}"]`).forEach(c => c.classList.add('playing'));
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

    // Passe les contrôles en mode « modification » d'un accord existant
    editChord(section, index) {
        const sections = loadProgressionSections();
        const d = sections[section] && sections[section].chords[index];
        if (!d) return;
        this.activeSection = section;

        document.getElementById('root').value = d.root;
        document.getElementById('quality').value = d.quality;
        document.getElementById('duration').value = String(beatsFromData(d));
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
        document.getElementById('instrument').value = d.instrument || 'piano';

        const chord = new Chord(d.root, d.quality, beatsFromData(d), d.inversion, d.drop, octaveFromData(d), d.bass);
        this.seqTouched = true; // le motif résolu ci-dessous fait autorité, on ne le régénère plus tant qu'on ne touche pas un réglage
        this.seqSelections = [];
        this.clearSeqHistory(); // nouvel accord chargé pour édition : l'historique précédent ne s'applique plus
        const { pattern, tie } = this.resolveSeqPatternForData(chord, d);
        this.setLiveSeqPattern(pattern, tie);

        this.editingIndex = index;
        document.getElementById('save').innerHTML = svgIcon('check') + ' Modifier';
        document.getElementById('cancel-edit').hidden = false;

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
                add9: '9', maj9: '9', m9: '9', dom9: '9',
                dom11: '11', dom13: '13'
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
                segs.push({ index: i, row, col, span, barStart: (pos % beatsPerBar === 0) });
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
        return { cells, rows: Math.max(1, Math.ceil(cursor / beatsPerRow)), beatsPerRow };
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
        const styleMap = {
            held: 'Tenu', pulsed: 'Noire stac.', arpeggio: 'Arpège',
            ronde_maintenu: 'Ronde', ronde_staccato: 'Ronde stac.',
            blanche_maintenu: 'Blanche', blanche_staccato: 'Blanche stac.',
            noire_maintenu: 'Noire', noire_staccato: 'Noire stac.',
            croche_maintenu: 'Croche', croche_staccato: 'Croche stac.'
        };
        const dragging = !!(this.drag && this.drag.moved);

        host.innerHTML = sections.map((sec, si) => {
            const history = sec.chords;
            const isActive = si === this.activeSection;
            let gridInner, gridStyle = '';

            if (history.length === 0) {
                gridInner = `<div class="empty-hint">Aucun accord. Règle un accord puis « Ajouter » pour le placer ici.</div>`;
            } else {
                const { cells, rows, beatsPerRow } = this.layoutProgression(history, beatsPerBar);
                gridStyle = `grid-template-rows: repeat(${rows}, var(--row-h)); grid-template-columns: repeat(${beatsPerRow}, 1fr);`;
                gridInner = cells.map(s => {
                    const h = history[s.index];
                    const roman = this.getRomanNumeral(gRoot, gMode, h.root, h.quality);
                    const styleLabel = styleMap[h.playStyle] || 'Tenu';
                    const chordUseFlats = useFlatsForChordRoot(NOTES.indexOf(h.root), NOTES.indexOf(gRoot), gMode, useFlats);
                    let sym = noteNameForPc(NOTES.indexOf(h.root), chordUseFlats) + (QUALITY_LABEL[h.quality] ?? '');
                    if (h.bass) sym += '/' + noteNameForPc(NOTES.indexOf(h.bass), chordUseFlats);

                    let cls = 'grid-cell';
                    if (dragging && this.drag.section === si && s.index === this.drag.index) {
                        cls += ' drag-placeholder';
                    } else {
                        if (isActive && s.index === this.selectedIndex) cls += ' selected';
                        if (isActive && s.index === this.editingIndex) cls += ' editing';
                    }
                    // arrondis / bords de coupe selon la position du segment dans l'accord
                    if (s.split) cls += s.isFirst ? ' seg-first' : (s.isLast ? ' seg-last' : ' seg-mid');
                    // repère de début de mesure (barre de mesure)
                    if (s.barStart) cls += ' bar-start';
                    // police réduite pour les segments courts (peu de temps)
                    if (s.span === 1) cls += ' sz1'; else if (s.span === 2) cls += ' sz2';
                    const style = `grid-column: ${s.col + 1} / span ${s.span}; grid-row: ${s.row + 1};`;

                    // Boutons (modifier + dupliquer) et méta uniquement sur le premier segment
                    const actions = s.isFirst ? `
                        <div class="cell-actions">
                            <button class="cell-edit" onclick="event.stopPropagation(); app.editChord(${si}, ${s.index})"
                                    title="Modifier cet accord" aria-label="Modifier cet accord">${svgIcon('pencil')}</button>
                            <button class="cell-dup" onclick="event.stopPropagation(); app.duplicateChord(${si}, ${s.index})"
                                    title="Dupliquer cet accord" aria-label="Dupliquer cet accord">${svgIcon('duplicate')}</button>
                        </div>` : '';
                    const romanEl = s.isFirst ? `<span class="cell-roman">${roman}</span>` : '';
                    const metaEl = s.isFirst ? `<span class="cell-meta">${styleLabel}</span>` : '';
                    const contFlag = (s.split && !s.isFirst) ? ' <span class="cell-cont">↩</span>' : '';

                    return `
                    <div class="${cls}" data-section="${si}" data-index="${s.index}" style="${style}" title="Toucher pour écouter · glisser pour déplacer">
                        ${actions}
                        ${romanEl}
                        <span class="cell-sym">${sym}${contFlag}</span>
                        ${metaEl}
                    </div>`;
                }).join('');
            }

            const titleVal = (sec.title || '').replace(/"/g, '&quot;');
            const canDelete = sections.length > 1;
            return `
            <div class="prog-section${isActive ? ' active' : ''}">
                <div class="prog-section-head">
                    <input type="text" class="prog-title" data-section="${si}" placeholder="Titre de la partie (ex. Couplet 1)" value="${titleVal}">
                    ${canDelete ? `<button type="button" class="prog-section-del" data-section="${si}" title="Supprimer cette partie" aria-label="Supprimer cette partie">${svgIcon('trash')}</button>` : ''}
                </div>
                <div class="chord-grid" data-section="${si}" style="${gridStyle}">${gridInner}</div>
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

        this.updateSaveButtons();
        this.updateUndoRedoButtons();
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

    // ---------- Morceaux : enregistrer/charger plusieurs chansons séparées ----------

    // Y a-t-il quelque chose de significatif dans le tampon de travail actuel (pour avertir avant
    // de l'écraser si aucun morceau n'est ouvert pour le recueillir automatiquement) ?
    hasUnsavedContent() {
        const sections = loadProgressionSections();
        if (sections.length > 1) return true;
        return sections.some(s => s.chords.length > 0 || (s.title && s.title.trim()));
    }

    // Avant de quitter le tampon actuel (nouveau morceau, ou en charger un autre) : si rien n'est
    // ouvert et qu'il contient quelque chose, prévient qu'il va être perdu.
    confirmDiscardUnsavedIfNeeded() {
        if (getCurrentSongId() || !this.hasUnsavedContent()) return true;
        return confirm('Le morceau en cours n\'est pas enregistré et sera perdu. Continuer ?');
    }

    refreshSongList() {
        const select = document.getElementById('song-select');
        if (!select) return;
        const songs = loadSongs().slice().sort((a, b) => b.savedAt - a.savedAt);
        const currentId = getCurrentSongId();
        select.innerHTML = `<option value="">— Non enregistré —</option>` +
            songs.map(s => `<option value="${s.id}">${escapeHtml(s.name)}</option>`).join('');
        select.value = currentId || '';
        document.getElementById('song-save').title = currentId ? 'Enregistrer sous...' : 'Enregistrer';
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
        saveProgressionSections([{ title: '', chords: [] }]);
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

    // Charge un morceau enregistré : il devient le morceau ouvert (autosauvegardé en continu ensuite)
    loadSong(id) {
        const song = loadSongs().find(s => s.id === id);
        if (!song) return;
        setCurrentSongId(id);
        document.getElementById('global-root').value = song.root || 'C';
        document.getElementById('global-mode').value = song.mode || 'maj';
        document.getElementById('time-sig').value = song.timeSig || '4/4';
        document.getElementById('groove').value = song.groove || 'straight';
        document.getElementById('bpm').value = song.bpm || 120;
        document.getElementById('bpm-val').value = String(song.bpm || 120);
        saveProgressionSections(song.sections && song.sections.length ? song.sections : [{ title: '', chords: [] }]);
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

    // Enregistre l'état actuel sous un nom : nouveau morceau, ou copie séparée si un morceau est
    // déjà ouvert (ce dernier continue d'être autosauvegardé sous son propre nom en parallèle).
    // Le select se cache et un champ de saisie apparaît à sa place, plutôt qu'un prompt() natif
    // pour choisir le nom du morceau à enregistrer.
    saveCurrentAsSong() {
        const currentId = getCurrentSongId();
        const existing = currentId ? loadSongs().find(s => s.id === currentId) : null;
        const select = document.getElementById('song-select');
        if (!select || select.hidden) return; // déjà en cours de saisie

        select.hidden = true;
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'compact song-select-full inline-rename-input';
        input.placeholder = existing ? 'Enregistrer une copie sous quel nom ?' : 'Nom du morceau…';
        input.value = existing ? existing.name : '';
        select.insertAdjacentElement('afterend', input);
        input.focus();
        input.select();

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
    }

    closeSettings() {
        this.settingsOpen = false;
        document.getElementById('settings-overlay').hidden = true;
        document.getElementById('open-settings').classList.remove('active');
    }

    // ---- Panneau Son : volume général (maître), puis volume des accords et du métronome ----
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
                    <label for="chord-volume">Volume des accords</label>
                    <span class="val" id="chord-volume-val">${this.chordVolumePercent}</span>
                </div>
                <input type="range" id="chord-volume" min="0" max="100" value="${this.chordVolumePercent}">
            </div>
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
            <div class="settings-slider-hint">Le volume général s'applique en plus des deux réglages spécifiques ci-dessus, sans changer leur équilibre l'un par rapport à l'autre. Le tempo se règle dans la carte « Morceau » (cliquer sur sa valeur permet de la saisir directement au clavier).</div>`;

        document.getElementById('general-volume').oninput = (e) => this.setGeneralVolume(+e.target.value);
        document.getElementById('chord-volume').oninput = (e) => this.setChordVolume(+e.target.value);
        document.getElementById('metronome-volume').oninput = (e) => this.setMetronomeVolume(+e.target.value);
        document.getElementById('metronome-sound').onchange = (e) => this.setMetronomeSound(e.target.value);
    }

    setGeneralVolume(percent) {
        this.generalVolumePercent = percent;
        Tone.Destination.volume.value = percentToDb(percent);
        const val = document.getElementById('general-volume-val');
        if (val) val.textContent = percent;
        localStorage.setItem(GENERAL_VOLUME_KEY, String(percent));
    }

    setChordVolume(percent) {
        this.chordVolumePercent = percent;
        this.chordVolumeNode.volume.value = percentToDb(percent);
        const val = document.getElementById('chord-volume-val');
        if (val) val.textContent = percent;
        localStorage.setItem(CHORD_VOLUME_KEY, String(percent));
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
    playMetronomeClick(accent, time) {
        METRONOME_SOUNDS[this.metronomeSoundKey].trigger(this.metronome, accent, time);
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
                <button type="button" id="files-undo-btn" class="icon-btn" title="Annuler (Ctrl+Z)" aria-label="Annuler" ${this.filesUndoStack.length ? '' : 'disabled'}>
                    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/></svg>
                </button>
                <button type="button" id="files-redo-btn" class="icon-btn" title="Rétablir (Ctrl+Y)" aria-label="Rétablir" ${this.filesRedoStack.length ? '' : 'disabled'}>
                    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 14l5-5-5-5"/><path d="M20 9H9.5a5.5 5.5 0 0 0 0 11H13"/></svg>
                </button>
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
        const u = document.getElementById('files-undo-btn');
        if (u) u.onclick = () => this.filesUndo();
        const r = document.getElementById('files-redo-btn');
        if (r) r.onclick = () => this.filesRedo();
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
            app: 'HarmoBox',
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
        a.download = `harmobox-bibliotheque-${new Date().toISOString().slice(0, 10)}.json`;
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
            this.flashHint('Fichier invalide — ce n\'est pas une sauvegarde HarmoBox');
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
            e.preventDefault();
            this.openContextMenu(e.clientX, e.clientY, targetFn());
        });

        let pressTimer = null, startX = 0, startY = 0, longPressed = false;
        el.addEventListener('touchstart', (e) => {
            if (e.touches.length !== 1) return;
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
        this.contextMenuTarget = target;
        const menu = document.getElementById('context-menu');
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
        this.updateFilesUndoRedoButtons();
    }

    filesUndo() {
        if (this.filesUndoStack.length === 0) { this.flashHint('Rien à annuler dans les fichiers'); return; }
        this.filesRedoStack.push(JSON.stringify({ folders: loadFolders(), songs: loadSongs() }));
        const prev = JSON.parse(this.filesUndoStack.pop());
        saveFolders(prev.folders);
        saveSongs(prev.songs);
        this.refreshSongList();
        if (this.settingsOpen) this.renderFilesPanel();
        this.updateFilesUndoRedoButtons();
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
        this.updateFilesUndoRedoButtons();
        this.flashHint('Rétabli');
    }

    updateFilesUndoRedoButtons() {
        const u = document.getElementById('files-undo-btn');
        const r = document.getElementById('files-redo-btn');
        if (u) u.disabled = this.filesUndoStack.length === 0;
        if (r) r.disabled = this.filesRedoStack.length === 0;
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

        const ROLE_COLOR = { root: '#00c853', third: '#2f81f7', fifth: '#e53922', seventh: '#ff9800', ext: '#8bd6a8' };
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

        const allChords = []; // à plat, dans l'ordre de lecture, pour la page 2
        sections.forEach((sec, si) => {
            const title = (sec.title && sec.title.trim()) ? sec.title : `Partie ${si + 1}`;
            page1 += `<h2 class="print-section-title">${escapeHtml(title)}</h2>`;
            if (!sec.chords.length) {
                page1 += `<div class="print-empty">—</div>`;
                return;
            }
            page1 += `<div class="print-chord-row">`;
            sec.chords.forEach(data => {
                const chord = new Chord(data.root, data.quality, beatsFromData(data), data.inversion, data.drop, octaveFromData(data), data.bass);
                const chordUseFlats = useFlatsForChordRoot(NOTES.indexOf(data.root), NOTES.indexOf(gRoot), gMode, useFlats);
                const sym = chord.getLabel(chordUseFlats);
                const roman = this.getRomanNumeral(gRoot, gMode, data.root, data.quality);
                const beats = beatsFromData(data);
                page1 += `<div class="print-chord-cell" style="flex-grow:${beats};">
                    <span class="print-chord-roman">${roman}</span>
                    <span class="print-chord-sym">${escapeHtml(sym)}</span>
                </div>`;
                allChords.push({ chord, sym });
            });
            page1 += `</div>`;
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

        let page2 = `<div class="print-page"><h1 class="print-title">Voicings</h1><div class="print-piano-grid">`;
        uniqueChords.forEach(({ chord, sym }) => {
            page2 += `<div class="print-piano-item">
                <div class="print-piano-label">${escapeHtml(sym)}</div>
                ${this.buildPianoDiagramSVG(chord)}
            </div>`;
        });
        page2 += `</div></div>`;

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
                const midis = chord.getMidiNotes();
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
        const chordVolumePercent = this.chordVolumePercent;

        return Tone.Offline(() => {
            Tone.Destination.volume.value = percentToDb(generalVolumePercent);
            const volumeNode = new Tone.Volume(percentToDb(chordVolumePercent)).toDestination();
            const instruments = new Map(); // clé instrument -> instance dédiée à ce rendu
            const instrumentFor = (key) => {
                if (!INSTRUMENT_BANKS[key]) key = 'piano';
                if (!instruments.has(key)) instruments.set(key, INSTRUMENT_BANKS[key].build().connect(volumeNode));
                return instruments.get(key);
            };

            let timeOffset = lead;
            sections.forEach(sec => {
                sec.chords.forEach(data => {
                    const beats = beatsFromData(data);
                    const chord = new Chord(data.root, data.quality, beats, data.inversion, data.drop, octaveFromData(data), data.bass);
                    const notes = chord.getNotes();
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

    // ---------- Grille interactive : tap (écoute), glisser (déplacer) ----------
    // Un seul écouteur délégué sur le conteneur de TOUTES les parties (chaque grille est reconstruite
    // à chaque rendu, contrairement à ce conteneur qui reste stable).
    setupGridInteractions() {
        const host = document.getElementById('progression-sections');
        host.addEventListener('pointerdown', (e) => this.onGridPointerDown(e));
    }

    onGridPointerDown(e) {
        if (e.button != null && e.button !== 0) return; // clic gauche / touch uniquement
        const gridEl = e.target.closest('.chord-grid');
        if (!gridEl) return;
        const section = +gridEl.dataset.section;

        const cell = e.target.closest('.grid-cell');
        if (cell && !e.target.closest('.cell-actions')) {
            const rect = cell.getBoundingClientRect();
            this.drag = {
                section,
                index: parseInt(cell.dataset.index),   // position vivante de l'accord déplacé
                origIndex: parseInt(cell.dataset.index),
                startX: e.clientX, startY: e.clientY,
                offsetX: e.clientX - rect.left,        // pour que le fantôme ne saute pas sous le doigt
                offsetY: e.clientY - rect.top,
                width: rect.width, height: rect.height,
                moved: false, ghost: null, cell,
                pointerType: e.pointerType || 'mouse'
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

        if (!d.moved) {
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
                // Réagencement VIVANT : on déplace l'accord et la grille se réorganise (droite / ligne suivante)
                this.moveChordLive(d.section, d.index, targetIndex);
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

        if (!d.moved) {
            const now = Date.now();
            const touch = d.pointerType === 'touch';
            const isSecondTap = this._lastTap && this._lastTap.section === d.section && this._lastTap.index === d.index && (now - this._lastTap.time) < 350;
            if (isSecondTap) {
                this._lastTap = null;
                if (touch) this.removeChord(d.section, d.index); // double-tap (tactile) = supprimer
                else this.editChord(d.section, d.index);         // double-clic (souris/stylet) = modifier
            } else {
                this._lastTap = { section: d.section, index: d.index, time: now };
                this.selectChord(d.section, d.index); // simple tap/clic = écouter
            }
            return;
        }
        // La grille est déjà dans l'ordre final ; on répercute le déplacement sur sélection/édition
        this.selectedIndex = this._shiftIndex(this.selectedIndex, d.origIndex, d.index);
        this.editingIndex = this._shiftIndex(this.editingIndex, d.origIndex, d.index);
        this.loadProgression();
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
        const voices = chord.getMidiNotes().length;
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
        const voices = chord.getMidiNotes().length;
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
        const voices = chord.getMidiNotes().length;
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

        // Si la croche touchée appartient à une note existante ET qu'elle en est le DÉBUT, la FIN,
        // ou l'unique croche, un glissé pourra étirer/raccourcir la note depuis ce bord. Mais un
        // simple tap (sans glisser) se contente TOUJOURS de sélectionner, exactement comme au milieu
        // d'une note : cliquer ne modifie jamais rien, seul un vrai glissé le fait.
        let resize = null;
        if (wasOn) {
            const chord = this.readChord();
            const { pattern, tie } = this.getLiveSeqPattern(chord);
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
        this.seqDrag = {
            mode: 'paint', voice, wasOn, startStep: step, lastStep: step, moved: false,
            rowCells: null, touched: {}, additive: e.ctrlKey || e.metaKey,
            resize, resizeChanged: false, crossedThreshold: false,
            curStart: resize ? resize.noteStart : null, curEnd: resize ? resize.noteEnd : null,
            noteEl: null, startX: e.clientX, startY: e.clientY
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

        // Aller-retour du geste : restaure hors de la nouvelle plage les croches déjà modifiées
        if (d.rangeFrom != null) {
            for (let s = d.rangeFrom; s <= d.rangeTo; s++) {
                if (s < newFrom || s > newTo) {
                    const orig = d.touched[s];
                    this.applySeqCell(d.voice, s, orig.on, orig.tied);
                }
            }
        }
        for (let s = newFrom; s <= newTo; s++) {
            this.rememberSeqOriginalState(d, s);
            const tied = paintOn && (s !== d.startStep);
            this.applySeqCell(d.voice, s, paintOn, tied);
        }
        d.rangeFrom = newFrom;
        d.rangeTo = newTo;
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
    }

    renderSequencer() {
        const chord = this.syncSeqPatternForCurrentChord();
        const host = document.getElementById('arp-sequencer');
        if (!host) return;
        host.hidden = !this.seqOpen;
        if (!this.seqOpen) return;

        const midis = chord.getMidiNotes();
        const noteNames = chord.getDisplayNotes(this.useFlatsForRoot(chord.root));
        const roleMap = chord.getRoleMap(); // même code couleur que le clavier : fondamentale/tierce/quinte/7e/extensions
        const voices = midis.length;
        const steps = chord.beats * SEQ_STEPS_PER_BEAT;
        const { pattern, tie } = this.getLiveSeqPattern(chord);

        // La colonne des noms de voix (max-content) se resserre à la largeur réelle du texte affiché
        // (ex. "C3", "F#3") au lieu d'une largeur fixe généreuse qui laissait un vide à gauche.
        let html = `<div class="seq-scroll"><div class="seq-grid" style="grid-template-columns: max-content repeat(${steps}, minmax(11px, 1fr));">`;

        // Cases de la grille : zones de clic/glisser (toujours présentes, sous les notes visuelles).
        // Placement explicite (grid-row/grid-column) sur TOUT le monde : les notes ci-dessous se
        // superposent volontairement aux cases, et le placement automatique de la grille CSS
        // évite les zones déjà occupées par un élément placé explicitement — sans ça, les cases
        // se retrouveraient décalées pour « fuir » les notes au lieu de rester dessous.
        // Chaque paire de cases (double-croches s pair/impair) partage visuellement le même
        // rectangle qu'avant (voir .seq-cell-a/.seq-cell-b dans le CSS) : la résolution de clic/
        // glisser est fine, mais rien ne change à l'œil tant qu'une note n'utilise pas cette finesse.
        let rowIndex = 0;
        for (let r = voices - 1; r >= 0; r--) {
            rowIndex++;
            html += `<div class="seq-label" style="grid-row:${rowIndex}; grid-column:1;">${noteNames[r]}</div>`;
            for (let s = 0; s < steps; s++) {
                const beatStart = (s % SEQ_STEPS_PER_BEAT === 0) ? ' beat-start' : '';
                const pairCls = (s % 2 === 0) ? ' seq-cell-a' : ' seq-cell-b';
                // Croche au début ou à la fin d'une note : indice visuel discret (curseur) qu'un
                // glissé depuis là peut étirer/raccourcir la note (pas de poignée visible séparée).
                const isEdge = pattern[s].includes(r) && (
                    !(s > 0 && pattern[s - 1].includes(r) && tie[s].includes(r)) ||
                    !(s + 1 < steps && pattern[s + 1].includes(r) && tie[s + 1].includes(r))
                );
                const edgeCls = isEdge ? ' seq-cell-edge' : '';
                const onCls = pattern[s].includes(r) ? ' on' : '';
                html += `<div class="seq-cell${pairCls}${beatStart}${edgeCls}${onCls}" data-step="${s}" data-voice="${r}" style="grid-row:${rowIndex}; grid-column:${s + 2};"></div>`;
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
        for (let r = voices - 1; r >= 0; r--) {
            rowIndex++;
            let s = 0;
            while (s < steps) {
                if (!pattern[s].includes(r)) { s++; continue; }
                const runStart = s;
                s++;
                while (s < steps && pattern[s].includes(r) && tie[s].includes(r)) s++;
                const runEnd = s - 1;
                const runLen = s - runStart;
                const shape = runLen > 1 ? 'run' : 'single';
                const role = roleMap[midis[r]] || 'ext';
                const isSelected = this.seqSelections.some(sel => sel.voice === r && sel.start === runStart);
                const sel = isSelected ? ' selected' : '';
                // Si la note finit sur la 2e moitié d'un rectangle (voir .seq-cell-b), la case de
                // fond s'arrête 4px avant le bord de la piste (son margin-right) pour laisser le
                // vrai espacement avant la paire suivante — sans ce même retrait, la pilule (qui
                // occupe toute la piste) dépasserait légèrement de ce rectangle de fond.
                const trimEnd = (runEnd % 2 === 1) ? ' margin-right:4px;' : '';
                notesHtml += `<div class="seq-note ${shape} role-${role}${sel}" data-voice="${r}" data-start="${runStart}" data-end="${runEnd}" style="grid-row:${rowIndex}; grid-column:${runStart + 2} / span ${runLen};${trimEnd}"></div>`;
            }
        }
        html += notesHtml;

        html += `</div></div>`;
        // Les préréglages rythmiques (Tenu, Noire...) se choisissent désormais uniquement via le
        // menu déroulant Lecture ; cette rangée ne garde que l'écoute directe et le nettoyage.
        const hasSelection = this.seqSelections.length > 0;
        const delSelLabel = this.seqSelections.length > 1 ? `sélection (${this.seqSelections.length})` : 'sélection';
        html += `<div class="seq-presets">
            <button type="button" id="seq-play" class="btn-prog">${svgIcon('play')} Lecture</button>
            <button type="button" id="seq-stop" class="btn-stop">${svgIcon('stop')} Stop</button>
            <button type="button" data-preset="clear" class="seq-delete-btn">${svgIcon('trash')} tout</button>
            <button type="button" id="seq-delete-selection" class="seq-delete-btn" ${hasSelection ? '' : 'disabled'}>${svgIcon('trash')} ${delSelLabel}</button>
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
    }

    // Clic sur une case : sélectionne (surbrillance) + écoute l'accord
    selectChord(section, index) {
        this.activeSection = section;
        this.selectedIndex = index;
        this.loadProgression(); // re-render pour afficher la surbrillance
        this.playSavedChord(section, index);
    }

    async playSavedChord(section, index) {
        await Tone.start();
        this.stopAll();

        const sections = loadProgressionSections();
        const data = sections[section] && sections[section].chords[index];
        if (!data) return;

        const chord = new Chord(data.root, data.quality, beatsFromData(data), data.inversion, data.drop, octaveFromData(data), data.bass);
        const notes = chord.getNotes();
        const midis = chord.getMidiNotes();
        const roleMap = chord.getRoleMap();
        const useFlats = this.useFlatsForRoot(chord.root);

        // Affiche l'accord sélectionné dans le grand titre + cadre le clavier
        const disp = document.getElementById('current-chord-display');
        disp.innerHTML = `<span class="chord-title">${flatTight(chord.getLabel(useFlats))}</span><span class="chord-notes">${chordNotesHtml(chord, useFlats)}</span>`;
        this.ensurePianoWindow(midis);

        const bpm = parseInt(document.getElementById('bpm').value);
        const secPerBeat = 60 / bpm;
        const { pattern: seqPattern, tie: seqTie } = this.resolveSeqPatternForData(chord, data);
        this.schedulePlayback(notes, midis, seqPattern, seqTie, secPerBeat, 0.1, roleMap, data.instrument || 'piano');
        this.isPlaying = true;

        // En fin de lecture, on GARDE l'accord affiché sur le clavier (au lieu de l'effacer)
        Tone.Transport.schedule((t) => {
            Tone.Draw.schedule(() => { this.ensurePianoWindow(midis); this.updateViz(midis, roleMap); this.isPlaying = false; }, t);
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
    pushUndo(sections) {
        this.undoStack.push(JSON.parse(JSON.stringify(sections))); // copie profonde
        if (this.undoStack.length > this.undoLimit) this.undoStack.shift();
        this.redoStack = [];
        this.updateUndoRedoButtons();
    }

    undo() {
        if (this.undoStack.length === 0) { this.flashHint('Rien à annuler'); return; }
        const current = loadProgressionSections();
        this.redoStack.push(JSON.parse(JSON.stringify(current)));
        const prev = this.undoStack.pop();
        saveProgressionSections(prev);
        this.afterHistoryRestore(prev);
        this.flashHint('Annulé');
    }

    redo() {
        if (this.redoStack.length === 0) { this.flashHint('Rien à rétablir'); return; }
        const current = loadProgressionSections();
        this.undoStack.push(JSON.parse(JSON.stringify(current)));
        const next = this.redoStack.pop();
        saveProgressionSections(next);
        this.afterHistoryRestore(next);
        this.flashHint('Rétabli');
    }

    // Après un undo/redo : les indices de sélection/édition ne correspondent plus forcément
    // à l'état restauré, donc on les réinitialise prudemment plutôt que de risquer un décalage.
    afterHistoryRestore(sections) {
        if (this.editingIndex != null) this.exitEditMode();
        if (this.activeSection >= sections.length) this.activeSection = Math.max(0, sections.length - 1);
        this.selectedIndex = null;
        this.loadProgression();
        this.updateUndoRedoButtons();
    }

    updateUndoRedoButtons() {
        const undoBtn = document.getElementById('undo-btn');
        const redoBtn = document.getElementById('redo-btn');
        if (undoBtn) undoBtn.disabled = this.undoStack.length === 0;
        if (redoBtn) redoBtn.disabled = this.redoStack.length === 0;
    }

    // Vide l'historique annuler/rétablir (appelé lors d'un changement de morceau : undo/redo
    // ne doit pas traverser deux morceaux différents)
    clearHistory() {
        this.undoStack = [];
        this.redoStack = [];
        this.updateUndoRedoButtons();
    }

    // ---------- Annuler / Rétablir dans le séquenceur ----------
    // Historique SÉPARÉ de celui de la grille d'accords : il porte sur le motif de l'accord en cours
    // d'édition (l'input caché #arpPattern), pas encore « Ajouté »/« Modifié » dans la progression.
    // Une simple chaîne suffit comme instantané, puisque c'est déjà la représentation complète du motif.
    pushSeqUndo() {
        this.seqUndoStack.push(document.getElementById('arpPattern').value);
        if (this.seqUndoStack.length > this.undoLimit) this.seqUndoStack.shift();
        this.seqRedoStack = [];
        this.updateSeqUndoRedoButtons();
    }

    seqUndo() {
        if (this.seqUndoStack.length === 0) { this.flashHint('Rien à annuler dans le séquenceur'); return; }
        this.seqRedoStack.push(document.getElementById('arpPattern').value);
        document.getElementById('arpPattern').value = this.seqUndoStack.pop();
        this.seqTouched = true;
        this.seqSelections = [];
        this.renderSequencer();
        this.updateSeqUndoRedoButtons();
        this.flashHint('Annulé');
    }

    seqRedo() {
        if (this.seqRedoStack.length === 0) { this.flashHint('Rien à rétablir dans le séquenceur'); return; }
        this.seqUndoStack.push(document.getElementById('arpPattern').value);
        document.getElementById('arpPattern').value = this.seqRedoStack.pop();
        this.seqTouched = true;
        this.seqSelections = [];
        this.renderSequencer();
        this.updateSeqUndoRedoButtons();
        this.flashHint('Rétabli');
    }

    updateSeqUndoRedoButtons() {
        const u = document.getElementById('seq-undo-btn');
        const r = document.getElementById('seq-redo-btn');
        if (u) u.disabled = this.seqUndoStack.length === 0;
        if (r) r.disabled = this.seqRedoStack.length === 0;
    }

    // Vide l'historique du séquenceur (nouvel accord chargé, réglages changés, ou motif enregistré
    // dans la grille : l'historique d'un accord n'a plus de sens pour un autre)
    clearSeqHistory() {
        this.seqUndoStack = [];
        this.seqRedoStack = [];
        this.updateSeqUndoRedoButtons();
    }

    // ---------- Raccourcis clavier ----------
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            const tag = (document.activeElement && document.activeElement.tagName) || '';
            const typing = ['INPUT', 'SELECT', 'TEXTAREA'].includes(tag)
                || (document.activeElement && document.activeElement.isContentEditable);
            const mod = e.ctrlKey || e.metaKey;

            if (e.key === 'Escape' && !document.getElementById('context-menu').hidden) { this.closeContextMenu(); return; }
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
            // Note du séquenceur sélectionnée : Suppr/Retour l'efface, ← → la raccourcit/rallonge
            // (prioritaire sur la sélection de la grille d'accords, plus locale à l'édition en cours)
            if (!typing && this.seqSelections.length > 0) {
                if (e.key === 'Delete' || e.key === 'Backspace') { this.deleteSelectedSeqNote(); e.preventDefault(); return; }
                if (e.key === 'ArrowRight') { this.resizeSelectedSeqNote(1); e.preventDefault(); return; }
                if (e.key === 'ArrowLeft') { this.resizeSelectedSeqNote(-1); e.preventDefault(); return; }
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

window.app = new HarmoBoxApp();
