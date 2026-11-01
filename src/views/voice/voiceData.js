// voiceData.js — die vier VOICE-Phasen (Stop/Submit/Struggle/Strike), 1:1 aus ~/aos/voice/phases.py (Chapter 19–24).
// Generiert; Änderungen an den Fragen gehören in phases.py.
export const VOICE_STAGES = [
 {
  "key": "stop",
  "heading": "STOP - Pattern Interrupt",
  "name": "Interrupting Patterns",
  "epigraph": [
   "To truly move forward, you must sometimes pause.",
   "The Alpha doesn't wait for life to make decisions for them. The Alpha chooses."
  ],
  "steps": [
   {
    "key": "pause",
    "kind": "pause",
    "prompt": "Be still. Quiet the mental noise.",
    "hint": "Stopping isn't just about physical stillness — it's about mental and spiritual stillness too.",
    "choices": [],
    "required": true,
    "seconds": 30,
    "group": ""
   },
   {
    "key": "pattern",
    "kind": "text",
    "prompt": "What pattern needs interrupting?",
    "hint": "Our days become a series of reactions … These reactions turn into habits, into routines.",
    "choices": [],
    "required": true,
    "seconds": 0,
    "group": ""
   },
   {
    "key": "trigger",
    "kind": "text",
    "prompt": "What triggered it this time?",
    "hint": "Which reaction are you running without thinking?",
    "choices": [],
    "required": true,
    "seconds": 0,
    "group": ""
   },
   {
    "key": "mode",
    "kind": "select",
    "prompt": "Are you surviving or thriving in this pattern?",
    "hint": "Survival is essential, but it's not the same as thriving.",
    "choices": [
     "surviving — reacting, being pushed around by the whirlwind",
     "thriving — choosing, leading, flourishing"
    ],
    "required": true,
    "seconds": 0,
    "group": ""
   },
   {
    "key": "forced",
    "kind": "select",
    "prompt": "Is this change forced on you, or do you choose it?",
    "hint": "Too often, people only change when they're forced to by trauma or drama.",
    "choices": [
     "forced — trauma, drama or external pressure",
     "chosen — a deliberate interruption of the old way"
    ],
    "required": true,
    "seconds": 0,
    "group": ""
   },
   {
    "key": "cost",
    "kind": "text",
    "prompt": "What does this pattern cost you if it keeps running?",
    "hint": "The return on investment of the pause: reset, recalibrate, redirect your energy.",
    "choices": [],
    "required": true,
    "seconds": 0,
    "group": ""
   },
   {
    "key": "choose",
    "kind": "confirm",
    "prompt": "Do you choose to stop?",
    "hint": "Stopping is the first step in acknowledging the need for change.",
    "choices": [],
    "required": true,
    "seconds": 0,
    "group": ""
   }
  ]
 },
 {
  "key": "submit",
  "heading": "SUBMIT - Face Truth",
  "name": "Humility Before Truth",
  "epigraph": [
   "To submit means to lay yourself bare, to strip away the masks and pretenses.",
   "Submission isn't about defeat; it's about empowerment."
  ],
  "steps": [
   {
    "key": "hidden",
    "kind": "text",
    "prompt": "What truth have you been hiding from?",
    "hint": "Radical honesty demands courage and vulnerability — no matter how uncomfortable.",
    "choices": [],
    "required": true,
    "seconds": 0,
    "group": ""
   },
   {
    "key": "facts",
    "kind": "text",
    "prompt": "What are the undeniable realities of your current situation?",
    "hint": "No exaggerations, no minimizing — just the pure, objective truth.",
    "choices": [],
    "required": true,
    "seconds": 0,
    "group": "Facts"
   },
   {
    "key": "emotions",
    "kind": "checkbox",
    "prompt": "Which emotions are present? Acknowledge all of them.",
    "hint": "Whether it's rage, joy, shame, or appreciation, every emotion gives you clues.",
    "choices": [
     "anger / rage",
     "fear",
     "shame",
     "doubt",
     "sadness",
     "joy",
     "gratitude",
     "appreciation",
     "pride",
     "peace"
    ],
    "required": false,
    "seconds": 0,
    "group": "Feelings"
   },
   {
    "key": "feelings",
    "kind": "text",
    "prompt": "How do you truly feel about these facts?",
    "hint": "Emotions are complex and layered. Go beyond surface reactions.",
    "choices": [],
    "required": true,
    "seconds": 0,
    "group": "Feelings"
   },
   {
    "key": "focus_mode",
    "kind": "select",
    "prompt": "What has been your mindset toward these facts and feelings?",
    "hint": "Have you been in denial, avoiding the truth, or confronting it head-on?",
    "choices": [
     "denial — I looked away",
     "avoidance — I knew and postponed it",
     "confrontation — I faced it head-on"
    ],
    "required": true,
    "seconds": 0,
    "group": "Focus"
   },
   {
    "key": "focus",
    "kind": "text",
    "prompt": "Where has your attention actually been going?",
    "hint": "",
    "choices": [],
    "required": true,
    "seconds": 0,
    "group": "Focus"
   },
   {
    "key": "fruit",
    "kind": "text",
    "prompt": "What results have you gotten from this mindset?",
    "hint": "What results or outcomes have you gotten from this mindset? And what do you want the results to be?",
    "choices": [],
    "required": true,
    "seconds": 0,
    "group": "Fruit"
   },
   {
    "key": "fruit_want",
    "kind": "text",
    "prompt": "What do you want the results to be?",
    "hint": "Recognize your potential — envision where you want to be.",
    "choices": [],
    "required": true,
    "seconds": 0,
    "group": "Fruit"
   },
   {
    "key": "honest",
    "kind": "confirm",
    "prompt": "Have you been radically honest — with yourself and with God?",
    "hint": "It's a sacred act, a moment of honesty with yourself and with God.",
    "choices": [],
    "required": true,
    "seconds": 0,
    "group": "Submit"
   }
  ]
 },
 {
  "key": "struggle",
  "heading": "STRUGGLE - Rewrite Story",
  "name": "Fighting Our Narratives",
  "epigraph": [
   "Every transformative journey hits a crucible, a tough test that reshapes the soul.",
   "It's a clash between who you were and who you are becoming."
  ],
  "steps": [
   {
    "key": "trigger",
    "kind": "text",
    "prompt": "What event or emotion pulled you away from the old story?",
    "hint": "Something triggers you … this new awareness rises to the surface, demanding that you deal with it.",
    "choices": [],
    "required": true,
    "seconds": 0,
    "group": ""
   },
   {
    "key": "old_story",
    "kind": "text",
    "prompt": "Old story: what narrative has been running?",
    "hint": "The narratives from your past that shaped your actions.",
    "choices": [],
    "required": true,
    "seconds": 0,
    "group": ""
   },
   {
    "key": "lie",
    "kind": "text",
    "prompt": "What lie or distortion is inside that story?",
    "hint": "Challenge it, question it.",
    "choices": [],
    "required": true,
    "seconds": 0,
    "group": ""
   },
   {
    "key": "comfort",
    "kind": "text",
    "prompt": "What does the familiar give you that keeps you in it?",
    "hint": "The mind naturally wants to stick with what it knows, preferring the comfort of the familiar.",
    "choices": [],
    "required": true,
    "seconds": 0,
    "group": ""
   },
   {
    "key": "want",
    "kind": "text",
    "prompt": "What do you truly want — and why?",
    "hint": "This is where you clarify what you truly want and why.",
    "choices": [],
    "required": true,
    "seconds": 0,
    "group": ""
   },
   {
    "key": "new_story",
    "kind": "text",
    "prompt": "New story: what truer narrative replaces it?",
    "hint": "The new stories you create during this struggle empower your desires.",
    "choices": [],
    "required": true,
    "seconds": 0,
    "group": ""
   },
   {
    "key": "identity",
    "kind": "text",
    "prompt": "Who do you become when you act from the new story?",
    "hint": "A war within yourself — outdated beliefs against new aspirations.",
    "choices": [],
    "required": true,
    "seconds": 0,
    "group": ""
   },
   {
    "key": "code",
    "kind": "text",
    "prompt": "Which principle of The Code gives you strength here?",
    "hint": "The Struggle is your daily battle, and The Code is your guide.",
    "choices": [],
    "required": true,
    "seconds": 0,
    "group": ""
   },
   {
    "key": "engage",
    "kind": "confirm",
    "prompt": "Will you engage the fight — not just write a diary entry?",
    "hint": "A passive Alpha might turn The Voice into just another diary entry.",
    "choices": [],
    "required": true,
    "seconds": 0,
    "group": ""
   }
  ]
 },
 {
  "key": "strike",
  "heading": "STRIKE - Decisive Action",
  "name": "Actions From Renewed Narratives",
  "epigraph": [
   "Dreams without steps to achieve them are just fantasies.",
   "It's the leap from \"what if\" to \"I did it.\""
  ],
  "steps": [
   {
    "key": "action",
    "kind": "text",
    "prompt": "What concrete action follows from the new story?",
    "hint": "Clear, decisive steps based on the renewed narratives.",
    "choices": [],
    "required": true,
    "seconds": 0,
    "group": ""
   },
   {
    "key": "first_step",
    "kind": "text",
    "prompt": "What is the first step in the next 10 minutes?",
    "hint": "Ideas are just the beginning. Without action, even the best insights are worthless.",
    "choices": [],
    "required": true,
    "seconds": 0,
    "group": ""
   },
   {
    "key": "deadline",
    "kind": "text",
    "prompt": "When exactly will it be done?",
    "hint": "",
    "choices": [],
    "required": true,
    "seconds": 0,
    "group": ""
   },
   {
    "key": "proof",
    "kind": "text",
    "prompt": "What proof will show that you executed?",
    "hint": "",
    "choices": [],
    "required": true,
    "seconds": 0,
    "group": ""
   },
   {
    "key": "cascade",
    "kind": "select",
    "prompt": "Which rhythm does this Strike drive?",
    "hint": "The daily force that drives your Weekly Fire, your Monthly Focus, and your journey towards Annual Freedom.",
    "choices": [
     "Weekly Fire",
     "Monthly Focus",
     "Annual Freedom"
    ],
    "required": true,
    "seconds": 0,
    "group": ""
   },
   {
    "key": "god",
    "kind": "text",
    "prompt": "Where does God's guidance meet this action?",
    "hint": "If you're open to Him, God can light your path … ensuring your actions align with a greater purpose.",
    "choices": [],
    "required": false,
    "seconds": 0,
    "group": ""
   },
   {
    "key": "execute",
    "kind": "confirm",
    "prompt": "Will you execute?",
    "hint": "It's not the brilliance of our thoughts but the strength of our actions that shapes our destiny.",
    "choices": [],
    "required": true,
    "seconds": 0,
    "group": ""
   }
  ]
 }
];
export const EMOTIONS = ["anger / rage","fear","shame","doubt","sadness","joy","gratitude","appreciation","pride","peace"];
