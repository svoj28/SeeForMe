// The first-run tutorial, written to be heard rather than read: short
// sentences, one idea per step, and every step says what to do next.
// The Filipino version should be reviewed by a native speaker.

const EN = [
  {
    title: 'Welcome',
    text:
      'Welcome to SeeForMe. This tutorial shows you how to use the app, one step at a time. It takes about 5 minutes. ' +
      'This screen has four buttons. At the top, Skip tutorial. In the middle, Back on the left and Repeat on the right. ' +
      'At the bottom, the largest button, Next. ' +
      'Touch a button once to hear its name. Double tap it to use it. ' +
      'You can also just say: next, back, repeat, or skip. ' +
      'Now find the Next button at the bottom of the screen, and double tap it.',
  },
  {
    title: 'Holding the phone',
    text:
      'SeeForMe uses the camera on the back of your phone. ' +
      'Hold the phone upright in front of your chest, with the screen facing you. ' +
      'The camera then looks at whatever is in front of you. ' +
      'Move slowly, and hold still for a moment when you ask the app to look. ' +
      'If the picture is too dark, blurry, or covered by a finger, the app will tell you.',
  },
  {
    title: 'The main screen',
    text:
      'When this tutorial ends, you will be on the main screen. From top to bottom, it has: ' +
      'a row of three buttons: Help, Voice, and Settings. ' +
      'Then the camera picture. Then a line of text with the last message. ' +
      'Then a row of three buttons: Repeat, Light, and Live. ' +
      'Then a row of two large buttons: the green Read text on the left, and the pink View money on the right. ' +
      'And at the very bottom, the largest button: Describe. ' +
      'The camera picture is big, so someone helping you can see what the camera sees.',
  },
  {
    title: 'Describe',
    text:
      'Describe tells you what is in front of you. Say: Hey Omni, what\'s on the camera. ' +
      'For example: A person ahead, about 2 meters away. A chair on your left. ' +
      'It knows about 80 kinds of everyday things, like people, cars, bicycles, dogs, chairs, tables, cups, and bottles. ' +
      'Sometimes it also says what kind of place you are in, like a kitchen or a street. ' +
      'When you are online, Describe uses Google Gemini for a fuller answer. ' +
      'If there is no internet, or the free online limit is used up, the phone describes instead, and I tell you once. ' +
      'When the limit resets, Gemini is used again by itself.',
  },
  {
    title: 'Read text',
    text:
      'The green Read text button reads printed text out loud: signs, labels, letters, and the screens of TVs, computers, and phones. ' +
      'Hold the phone about 30 centimeters from the text, straight in front of it, and keep still. ' +
      'If it is dark, turn on the light. On shiny screens, keep the light off.',
  },
  {
    title: 'View money',
    text:
      'The pink View money button, above Describe, tells you the value of Philippine bills and coins. ' +
      'Hold the money flat, about 15 centimeters in front of the camera, then double tap View money. ' +
      'The picture is taken right away. When you hear: Picture taken, you can move the camera. ' +
      'While it reads, you hear soft ticks, and then the amount, for example: 100 pesos. ' +
      'Online, it uses Google Gemini, which can read several bills and coins at once. Without internet, the phone reads it.',
  },
  {
    title: 'Guide me',
    text:
      'Not sure the money is in view? Double tap Guide me, to the left of View money. ' +
      'It tells you how to move the phone: move left, move right, up, down, closer, or farther away. ' +
      'A low tick means not yet. A high tick means the money is in the right place. ' +
      'When you hear: Ready, hold still and double tap View money. ' +
      'Guide me works on the phone only, so it is quick and works without internet. ' +
      'To stop it, double tap the same button again, or say: stop.',
  },
  {
    title: 'Live',
    text:
      'The Live button keeps describing what the camera sees, and speaks whenever something changes. ' +
      'Like Describe, it uses Google Gemini when online, and the phone when Gemini is not available. ' +
      'It is useful when you look around a room or walk slowly. ' +
      'To stop it, double tap Live again, or just say: stop.',
  },
  {
    title: 'Voice tools',
    text:
      'You can start extra tools by voice, without opening a menu: ' +
      'Read a document, which tells you how to move the phone until the whole page is in view, then reads it. ' +
      'Find an object, which beeps faster as the object gets to the middle of the camera. ' +
      'What color is this. A light detector. A product barcode scanner. An expiry date reader. ' +
      'View money, for peso bills and coins. Where am I, which says the nearest address. ' +
      'And Send picture to a helper, to send a photo to someone you trust. ' +
      'There is also an experimental obstacle warning, which is off until you turn it on in Settings. ' +
      'Say the name of a tool after Hey Omni, such as: Hey Omni, read a document, or Hey Omni, find my cup. View money is always on the main screen.',
  },
  {
    title: 'Voice commands',
    text:
      'You can use SeeForMe without touching the screen. Start every command with: Hey Omni. ' +
      "For example: Hey Omni, what's on the camera. Hey Omni, read this. Hey Omni, find my cup. Hey Omni, how much money is this. Hey Omni, guide me. " +
      'You can talk while the app is talking. To make it stop talking, just say: stop. ' +
      'Filipino commands work too.',
  },
  {
    title: 'Settings',
    text:
      'Settings, at the top right, lets you change SeeForMe to suit you. ' +
      'You can change how fast it talks, switch between English and Filipino, ' +
      'and turn each feature and tool on or off, such as voice commands, distances, or shake to describe. ' +
      'Help, at the top left, reads the screen layout and all voice commands, any time.',
  },
  {
    title: 'Staying safe',
    text:
      'SeeForMe can make mistakes, and it cannot see everything. It does not reliably detect steps, holes, curbs, glass, or doors. ' +
      'Distances are rough estimates. ' +
      'Always use your cane, guide dog, or other mobility aids, and never rely on this app to cross a street.',
  },
  {
    title: 'All done',
    text:
      'You finished the tutorial. ' +
      'To take it again later, say: Hey Omni, tutorial. Or double tap Settings, then Start tutorial. ' +
      'Now double tap the large button at the bottom, or say next, to start using SeeForMe.',
  },
];

const FIL = [
  {
    title: 'Maligayang pagdating',
    text:
      'Maligayang pagdating sa SeeForMe. Ipapakita ng tutorial na ito kung paano gamitin ang app, isa-isang hakbang. Mga 5 minuto lang ito. ' +
      'May apat na button ang screen na ito. Sa itaas, Laktawan ang tutorial. Sa gitna, Bumalik sa kaliwa at Repeat sa kanan. ' +
      'Sa ibaba, ang pinakamalaking button, Susunod. ' +
      'Pindutin nang isang beses ang button para marinig ang pangalan nito. I-double tap para gamitin. ' +
      'Puwede mo ring sabihin lang: susunod, bumalik, ulitin, o laktawan. ' +
      'Ngayon, hanapin ang Susunod na button sa ibaba ng screen, at i-double tap ito.',
  },
  {
    title: 'Paghawak sa phone',
    text:
      'Ginagamit ng SeeForMe ang camera sa likod ng phone mo. ' +
      'Hawakan nang patayo ang phone sa harap ng dibdib mo, nakaharap sa iyo ang screen. ' +
      'Makikita ng camera ang kahit anong nasa harap mo. ' +
      'Gumalaw nang dahan-dahan, at huwag munang gumalaw kapag pinapatingin mo ang app. ' +
      'Kapag masyadong madilim, malabo, o natatakpan ng daliri ang larawan, sasabihin ito ng app.',
  },
  {
    title: 'Ang main screen',
    text:
      'Pagkatapos ng tutorial, nasa main screen ka na. Mula itaas hanggang ibaba, mayroon itong: ' +
      'tatlong button na magkakatabi: Help, Voice, at Settings. ' +
      'Tapos ang larawan ng camera. Tapos isang linya ng text ng huling mensahe. ' +
      'Tapos tatlong button: Repeat, Light, at Live. ' +
      'Tapos dalawang malalaking magkatabing button: ang berdeng Read text sa kaliwa, at ang pink na Tingnan ang pera sa kanan. ' +
      'At sa pinakaibaba, ang pinakamalaking button: Describe. ' +
      'Malaki ang larawan ng camera, para makita ng tumutulong sa iyo ang nakikita ng camera.',
  },
  {
    title: 'Describe',
    text:
      'Sinasabi ng Describe kung ano ang nasa harap mo. Sabihin: Hey Omni, ano ang nasa camera. ' +
      'Halimbawa: May tao sa harap, mga 2 metro ang layo. May upuan sa kaliwa mo. ' +
      'Kilala nito ang mga 80 klase ng karaniwang bagay, gaya ng tao, kotse, bisikleta, aso, upuan, mesa, tasa, at bote. ' +
      'Minsan, sinasabi rin nito kung anong klaseng lugar ito, gaya ng kusina o kalsada. ' +
      'Kapag online, gumagamit ang Describe ng Google Gemini para mas buo ang sagot. ' +
      'Kapag walang internet, o naubos ang libreng online na limit, ang phone ang maglalarawan, at sasabihin ko ito nang isang beses. ' +
      'Kapag na-reset ang limit, kusang gagamitin ulit ang Gemini.',
  },
  {
    title: 'Read text',
    text:
      'Binabasa nang malakas ng berdeng Read text button ang nakasulat: mga karatula, label, sulat, at screen ng TV, computer, at cellphone. ' +
      'Hawakan ang phone nang mga 30 sentimetro mula sa text, diretso sa harap nito, at huwag igalaw. ' +
      'Kapag madilim, buksan ang ilaw. Sa makinang na screen, patayin ang ilaw.',
  },
  {
    title: 'Tingnan ang pera',
    text:
      'Sinasabi ng pink na Tingnan ang pera button, sa itaas ng Describe, kung magkano ang perang papel at barya ng Pilipinas. ' +
      'Hawakan nang patag ang pera, mga 15 sentimetro sa harap ng camera, tapos i-double tap ang Tingnan ang pera. ' +
      'Kukunan agad ang larawan. Kapag narinig mo ang: Nakuha na ang larawan, puwede mo nang igalaw ang camera. ' +
      'Habang nagbabasa, may maririnig kang mahihinang tik, tapos ang halaga, halimbawa: 100 piso. ' +
      'Kapag online, gumagamit ito ng Google Gemini, na kayang magbasa ng ilang papel at barya nang sabay. Kapag walang internet, ang phone ang magbabasa.',
  },
  {
    title: 'Gabayan ako',
    text:
      'Hindi sigurado kung kita ang pera? I-double tap ang Gabayan ako, sa kaliwa ng Tingnan ang pera. ' +
      'Sasabihin nito kung paano igagalaw ang phone: pakaliwa, pakanan, pataas, pababa, ilapit, o ilayo. ' +
      'Ang mababang tik ay hindi pa. Ang mataas na tik ay nasa tamang lugar na ang pera. ' +
      'Kapag narinig mo ang: Handa na, huwag gumalaw at i-double tap ang Tingnan ang pera. ' +
      'Sa phone lang gumagana ang Gabayan ako, kaya mabilis ito at gumagana kahit walang internet. ' +
      'Para itigil, i-double tap ulit ang parehong button, o sabihin: tigil.',
  },
  {
    title: 'Live',
    text:
      'Patuloy na inilalarawan ng Live button ang nakikita ng camera, at nagsasalita kapag may nagbago. ' +
      'Gaya ng Describe, gumagamit ito ng Google Gemini kapag online, at ng phone kapag hindi available ang Gemini. ' +
      'Nakakatulong ito kapag tumitingin ka sa paligid ng kwarto o dahan-dahang naglalakad. ' +
      'Para itigil, i-double tap ulit ang Live, o sabihin lang: tigil.',
  },
  {
    title: 'Mga tool sa boses',
    text:
      'Puwede mong simulan ang iba pang tool gamit ang boses, nang hindi nagbubukas ng menu: ' +
      'Basahin ang dokumento, na nagsasabi kung paano igagalaw ang phone hanggang makita ang buong pahina, tapos binabasa ito. ' +
      'Maghanap ng bagay, na bumibilis ang beep habang papunta sa gitna ng camera ang bagay. ' +
      'Anong kulay ito. Light detector. Barcode scanner ng produkto. Pagbasa ng expiry date. ' +
      'Tingnan ang pera, para sa perang papel at barya. Nasaan ako, na sinasabi ang pinakamalapit na address. ' +
      'At Ipadala ang larawan sa tutulong, para magpadala ng litrato sa taong pinagkakatiwalaan mo. ' +
      'May eksperimental ding obstacle warning, na sarado hangga’t hindi mo binubuksan sa Settings. ' +
      'Sabihin ang pangalan ng tool pagkatapos ng Hey Omni, gaya ng: Hey Omni, basahin ang dokumento, o Hey Omni, hanapin ang tasa. Nasa main screen palagi ang Tingnan ang pera.',
  },
  {
    title: 'Voice commands',
    text:
      'Puwede mong gamitin ang SeeForMe nang hindi hinahawakan ang screen. Simulan ang bawat command sa: Hey Omni. ' +
      'Halimbawa: Hey Omni, ano ang nasa camera. Hey Omni, basahin mo ito. Hey Omni, hanapin ang tasa. Hey Omni, magkano ito. Hey Omni, gabayan mo ako. ' +
      'Puwede kang magsalita habang nagsasalita ang app. Para patigilin ito, sabihin lang: tigil. ' +
      'Gumagana rin ang mga command sa English.',
  },
  {
    title: 'Settings',
    text:
      'Sa Settings, sa kanang itaas, puwede mong iayos ang SeeForMe para sa iyo. ' +
      'Puwede mong palitan ang bilis ng pagsasalita, lumipat sa pagitan ng English at Filipino, ' +
      'at buksan o patayin ang bawat feature at tool, gaya ng voice commands, layo, o alugin para mag-describe. ' +
      'Binabasa ng Help, sa kaliwang itaas, ang ayos ng screen at lahat ng voice command, kahit kailan.',
  },
  {
    title: 'Pag-iingat',
    text:
      'Puwedeng magkamali ang SeeForMe, at hindi nito nakikita ang lahat. Hindi nito maaasahang mapansin ang hagdan, butas, gilid ng bangketa, salamin, o pinto. ' +
      'Tantiya lang ang layo. ' +
      'Palaging gamitin ang tungkod, guide dog, o iba pang pantulong sa paglalakad, at huwag umasa sa app na ito sa pagtawid ng kalsada.',
  },
  {
    title: 'Tapos na',
    text:
      'Natapos mo na ang tutorial. ' +
      'Para ulitin ito mamaya, sabihin: Hey Omni, tutorial. O i-double tap ang Settings, tapos Simulan ang tutorial. ' +
      'Ngayon, i-double tap ang malaking button sa ibaba, o sabihin ang susunod, para simulan ang SeeForMe.',
  },
];

export const TUTORIAL = { en: EN, fil: FIL };
export const tutorialSteps = (lang) => TUTORIAL[lang] ?? EN;
// Kept for older callers: the English steps.
export const TUTORIAL_STEPS = EN;
