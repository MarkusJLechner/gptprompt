const predefinedData = {
  prompts: [
    // { name: '', prompt: ``, note: `` },
    {
      name: 'jp: Wort zu Satz',
      prompt: `Schreibe auf japanisch eine Kurzgeschichte mit Fokus auf das Wort "$0". $1

Das geschrieben soll helfen das Wort besser zu lernen. Halte alles geschriebene auf japanisch. Schreibe so kurz und bündig wie möglich, dennoch soll die Geschichte einprägsam sein.

Nach der Geschichte gehe auf das Wort "$0" ein und beschreibe die grammatikalische Bedeutung. Erkläre dabei leicht verständlich.
`,
      note: `Wort $0.
Kontext $1: Verwende dabei folgenden Kontext für das Wort: [[$$]]`,
    },

    // JP
    {
      name: 'jp: Wort zu Anwortseite',
      prompt: `Schreibe alles auf japanisch, bis auf die Bedeutungen in Listenform.
$1
Für folgendes Wort "$0" antworte mit folgendem Format. Verwende statt Romanji Kanji und optional Hiragana. Schreibe keine Einleitung. Bedeutung soll japanisch und deutsch beinhalten:
**意味：** [BEDEUTUNGEN IN EINER LISTENFORM (MIT DEUTSCHER ÜBERSETZUNG)]
**対義語：** [GEGENWORT]
**例：**
 * [1-3 JAPANISCHER SATZ OHNE ÜBERSETZUNG]
**象徴：**
[BILDLICHE DARSTELLUNG IN JAPANISCH]
**練習：**
[LÜCKENTEXT ODER ANDERE ÜBUNG]`,
      note: 'Wort $0. Kontext $1',
    },

    {
      name: 'jp: Wort im Satz',
      prompt: `Ich möchte, dass Sie als japanischer Satzerklärer fungieren, der sich darauf konzentriert, die Bedeutung und Verwendung des bestimmten Wortes "$1" in dem bestimmten Satz "$0" zu analysieren und zu klären. Wenn ich einen Satz "$0" und einem als "$1" markierten Zielwort anbiete, schlüsseln Sie bitte den Kontext und die Verwendung von "$1" innerhalb des Satzes "$0" auf. Geben Sie keine Übersetzungen oder Erklärungen zu anderen Aspekten des Satzes an und konzentrieren Sie sich auf das Wort "$1". Mein erster Satz ist "$0" und das Wort, das Sie erklären sollen, ist "$1". Kontext zum Wort ist: "$2".`,
      note: `Satz $0
Wort $1.
Kontext $2 "Kontext zum Wort ist: "$$"."`,
    },

    // DE
    { name: 'de: Wort zu Satz', prompt: `Schreibe einen prompt mit $0`, note: '' },
  ],

  scrapes: [
    // {
    //   url: '',
    //   name: '',
    //   selector: '',
    //   loading: false,
    //   fetchOnShare: true,
    //   clipHard: true,
    //   clipLength: 2500,
    // },

    // JP
    {
      url: 'https://dictionary.goo.ne.jp/word/$$/',
      name: 'jp: goo jisho',
      selector: '.contents',
      loading: false,
      fetchOnShare: true,
      clipHard: true,
      clipLength: 2500,
    },

    // DE
    {
      url: 'https://www.dwds.de/wb/etymwb/$$/',
      name: 'de: wörterbuch',
      selector: '.etymwb-entry',
      loading: false,
      fetchOnShare: true,
      clipHard: true,
      clipLength: 2500,
    },
  ],
}

export default {
  prompts: predefinedData.prompts.sort((a, b) => a.name.localeCompare(b.name)),
  scrapes: predefinedData.scrapes.sort((a, b) => a.name.localeCompare(b.name)),
}
