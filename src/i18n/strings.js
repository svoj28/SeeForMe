// Everything SeeForMe says or shows, in English and Filipino.
// Filipino uses natural Taglish: words like "camera", "button" and
// "double tap" stay in English, as most Filipino speakers say them.
// NOTE: the Filipino text should be reviewed by a native speaker.

export const STRINGS = {
  en: {
    on: 'on',
    off: 'off',
    // --- Buttons (touch to hear) -------------------------------------------
    'button.spoken': (label, hint) => `${label} button. ${hint ? `${hint}. ` : ''}Double tap to use.`,
    'button.notAvailable': (label) => `${label}. Not available right now.`,

    // --- Camera / general --------------------------------------------------
    'camera.starting': 'The camera is still starting. Please try again in a moment.',
    'camera.error': 'Sorry, something went wrong looking at the picture. Please try again.',
    'camera.mountError': 'The camera could not start. Close the app and open it again.',
    'model.loadError': 'The recognition model could not load. Please restart the app.',
    'status.ready': 'Ready. Say "Hey Omni, what\'s on the camera"',
    'describe.looking': 'Looking. Hold still.',
    'read.reading': 'Reading. Hold still.',
    'repeat.nothing': 'Nothing to repeat yet. Use Describe or Read text first.',
    'torch.on': 'Light on.',
    'torch.off': 'Light off.',
    'torch.alreadyOn': 'The light is already on.',
    'torch.alreadyOff': 'The light is already off.',
    'live.on': 'Live description on. I will tell you whenever what I see changes. Double tap Live again to stop.',
    'live.off': 'Live description off.',
    'live.already': 'Live description is already on.',
    'full.on': 'Full screen camera. Exit full screen is at the top right.',
    'full.off': 'Normal view. The camera picture is back between the top buttons and the status line.',
    'full.alreadyOn': 'The camera is already full screen.',
    'full.alreadyOff': 'The camera is not full screen.',
    'about.back': 'Back to the camera. Double tap Help at the top left to hear the screen layout.',
    'settings.back': 'Back to the camera.',

    // --- Greeting / layout / help ------------------------------------------
    'greet.short':
      'SeeForMe is ready. Describe is available by voice: say, Hey Omni, what\'s on the camera. For help, say: Hey Omni, help. Or double tap Help at the top left.',
    'greet.skipped': 'Tutorial skipped. You can take it any time: say, Hey Omni, tutorial. Or double tap Settings, then Start tutorial.',
    'layout.full':
      'Full screen camera. The camera picture fills the whole screen. At the top, a line of text showing the last message. ' +
      'At the top right, the Exit full screen button. ' +
      'Touch any button to hear its name, then double tap to use it.',
    'layout.normal': ({ torch, live, voice, tools, mode }) =>
      'Screen layout, from top to bottom. ' +
      `At the top, three buttons: Help on the left, Voice in the middle, which is ${voice ? 'on' : 'off'}, and Settings on the right. ` +
      'Below them, the camera picture, with a Full screen button at its bottom right corner. ' +
      'Then a line of text showing the last message. ' +
      `Then three buttons in a row: Repeat on the left, Light in the middle, which is ${torch ? 'on' : 'off'}, ` +
      `and Live on the right, which is ${live ? 'on' : 'off'}. ` +
      (tools
        ? 'Below them, two large buttons in one row: the green Read text on the left, and the pink View money on the right. '
        : 'Below them, the large green Read text button. ') +
      (mode ? `Then a wide button to stop ${mode}. ` : '') +
      'Describe is available by voice: say, Hey Omni, what\'s on the camera. ' +
      'Touch any button to hear its name, then double tap to use it.',
    'voice.tutorialOn':
      'You can also use your voice, without touching the screen. ' +
      "Say: Hey Omni, what's on the camera. And I will describe what is in front of you. " +
      'Say: Hey Omni, read this. And I will read the text. ' +
      'You can talk over me. To make me stop talking, just say: stop.',
    'voice.tutorialOff': 'Voice commands are off. Double tap the Voice button at the top to turn them on.',
    'help.buttons':
      'Describe tells you the kind of place, the objects in front of you, where they are, and roughly how far away. ' +
      'Read text reads printed text aloud: signs, labels, letters, and the screens of TVs, computers and phones. For text, hold the phone about 30 centimeters away. ' +
      'Live keeps describing what the camera sees, and speaks whenever something changes. ' +
      'Repeat says the last result again. Light turns the flashlight on or off. ' +
      'Extra tools, like finding an object, colors, money, and products, are also available by voice. ' +
      'Settings lets you turn features on or off, and change the speech speed and language. ' +
      'Hold the phone upright, with the back camera facing what you want to know about.',
    'help.voiceCommands':
      'All voice commands start with Hey Omni. ' +
      "What's on the camera: describes what is in front of you. Read this: reads printed text. " +
      'Start live: keeps describing. Stop: stops what I am doing and stops me talking. ' +
      'While I am talking, or while a tool is running, you can say just stop, without Hey Omni. ' +
      'Repeat. Turn on the light, or turn off the light. Full screen, or exit full screen. ' +
      'Read a document: guides you until the whole page is in view, then reads it. ' +
      'Find my cup, or any other object. What color is this. How much money is this. Guide me: helps you aim at the money. Scan product. Read the expiry date. ' +
      'Where am I. Share this picture. Light detector. Obstacle warning. More tools. Settings. ' +
      "What's on the screen: reads the screen layout. Help: reads these instructions. Tutorial: starts the tutorial. " +
      'You can also say just Hey Omni, wait for me to say Yes, and then say the command.',
    'voice.on': 'Voice commands on.',
    'voice.off': 'Voice commands off. The microphone is no longer listening.',
    'voice.needMic':
      'Voice commands need the microphone. To use them, allow microphone access for SeeForMe in Settings, then double tap the Voice button.',
    'voice.unsupported': 'Voice commands are not available on this phone. You can still use the buttons.',
    'voice.wake': 'Yes?',
    'voice.unknown': "Sorry, I didn't catch that. Say: Hey Omni, what's on the camera. Or: Hey Omni, help.",
    'voice.disabledTool': (name) => `${name} is turned off. You can turn it on in Settings.`,

    // --- Main buttons -------------------------------------------------------
    'btn.help': 'Help',
    'hint.help': 'Reads out the screen layout, what each button does, and the voice commands',
    'btn.voice': (on) => `Voice: ${on ? 'on' : 'off'}`,
    'hint.voice': (on) => (on ? 'Stops listening for Hey Omni' : 'Listens for voice commands that start with Hey Omni'),
    'btn.settings': 'Settings',
    'hint.settings': 'Turn features on or off, change speech speed and language',
    'btn.repeat': 'Repeat',
    'hint.repeat': 'Says the last result again',
    'btn.light': (on) => `Light: ${on ? 'on' : 'off'}`,
    'hint.light': (on) => (on ? 'Turns the flashlight off' : 'Turns the flashlight on, which helps in dark places'),
    'btn.live': (on) => `Live: ${on ? 'on' : 'off'}`,
    'hint.live': (on) => (on ? 'Stops describing automatically' : 'Keeps describing what the camera sees, whenever it changes'),
    'btn.readText': 'Read text',
    'btn.reading': 'Reading…',
    'hint.readText': 'Takes a picture and reads printed text aloud, including on TV, computer and phone screens',
    'btn.more': 'More tools',
    'hint.more': 'Opens extra tools: find an object, colors, money, products, and more',
    'btn.describe': 'Describe',
    'btn.looking': 'Looking…',
    'hint.describe': 'Takes a picture and says what is in front of you, where, and roughly how far away',
    'btn.fullScreen': 'Full screen',
    'btn.exitFull': 'Exit full screen',
    'hint.fullScreen': (on) => (on ? 'Returns to the normal view with all buttons' : 'Makes the camera picture fill the screen'),
    'btn.stopMode': (mode) => `Stop ${mode}`,
    'hint.stopMode': 'Stops the tool that is running',
    'btn.close': 'Close',
    'hint.close': 'Goes back to the camera',
    'btn.back': 'Back',
    'btn.about': 'About',
    'hint.about': 'Credits and safety information',
    'btn.startTutorial': 'Start tutorial',
    'hint.startTutorial': 'Takes the step by step tutorial again',

    // --- Modes ---------------------------------------------------------------
    'mode.find': 'finding',
    'mode.light': 'light detector',
    'mode.obstacle': 'obstacle warning',
    'mode.product': 'product scan',
    'mode.stopped': (mode) => `Stopped ${mode}.`,
    'mode.busy': 'Another tool is running. Say stop, or double tap the Stop button, first.',

    // --- Photo quality --------------------------------------------------------
    'quality.covered': 'The camera seems to be covered. Check that your fingers are not over the camera on the back of the phone.',
    'quality.dark': 'It is too dark to see. Turn on the light, or move to a brighter place.',
    'quality.blurry': 'The picture is blurry. Hold the phone still for a moment, and try again.',

    // --- Text framing (where the text is in the picture) -----------------------
    'frame.sides': { left: 'on the left', right: 'on the right', top: 'at the top', bottom: 'at the bottom' },
    'frame.moves': { left: 'to the left', right: 'to the right', up: 'up', down: 'down' },
    'frame.and': 'and',
    'frame.cut': (sides, moves) => `Some text is cut off ${sides}. Move the phone a little ${moves}.`,
    'frame.offCentre': (moves) => `The text is near the edge of the picture. Move the phone a little ${moves}.`,
    'frame.back': 'The text is bigger than the picture. Move the phone a little farther away.',
    'frame.closer': 'The text is small. Move the phone a little closer.',
    'frame.good': 'All the text is in view. Hold still.',
    'frame.tip': (advice) => `Tip: ${advice}`,
    'document.start':
      'Read a document. Hold the phone flat above the page, about 30 centimeters away, with the camera facing the page. ' +
      'I will tell you how to move the phone until the whole page is in view. Then I will read it. Say stop to cancel.',
    'document.noText': 'No text yet. Hold the phone above the page, about 30 centimeters away.',
    'document.reading': 'All the text is in view. Hold still. Reading.',
    'mode.document': 'reading a document',
    'tool.document': 'Read a document',
    'tool.document.hint': 'Tells you how to move the phone until the whole page is in view, then reads it',
    'set.documentTool': 'Read a document',
    'set.framingTips': 'Text framing tips',
    'set.framingTips.hint': 'After reading text, say if some was cut off and which way to move the phone',
    'settings.section.reading': 'Reading text',

    // --- Tools menu -----------------------------------------------------------
    'tools.title': 'More tools',
    'tools.current': (label) => `${label}, on your tool button`,
    'tools.position': (n, total) => `${n} of ${total}`,
    'hint.toolButton': (hint) => `Your chosen tool. ${hint}. To change it, pick another tool in More tools`,
    'status.label': (text) => `Last message: ${text}`,
    'tools.opened': (names) =>
      `More tools. ${names.length} buttons, from top to bottom: ${names.join(', ')}. The Close button is at the bottom.`,
    'tools.none': 'All extra tools are turned off. You can turn them on in Settings.',
    'tool.find': 'Find an object',
    'tool.find.hint': 'Beeps faster as the object gets closer to the middle of the camera',
    'tool.colour': 'What color is this',
    'tool.colour.hint': 'Says the color in the middle of the camera picture',
    'tool.light': 'Light detector',
    'tool.light.hint': 'Plays a higher beep for brighter light',
    'tool.product': 'Scan product barcode',
    'tool.product.hint': 'Reads the product name from its barcode',
    'tool.expiry': 'Read expiry date',
    'tool.expiry.hint': 'Finds the expiry or best before date on a package',
    'tool.money': 'View money',
    'tool.money.hint': 'Says the value of Philippine bills and coins. Online, the photo is sent to Google Gemini; without internet it reads on the phone',
    'tool.where': 'Where am I',
    'tool.where.hint': 'Says the nearest street address',
    'tool.share': 'Send picture to a helper',
    'tool.share.hint': 'Takes a picture and lets you send it to someone in a message app',
    'tool.obstacle': 'Obstacle warning',
    'tool.obstacle.hint': 'Experimental. Vibrates when something seems close ahead',

    // --- Find -------------------------------------------------------------------
    'find.pickTitle': 'Find what?',
    'find.pickOpened': (names) => `Find what? ${names.length} buttons: ${names.join(', ')}. The Close button is at the bottom.`,
    'find.start': (name) =>
      `Looking for a ${name}. Turn slowly. I will beep faster when it is in the middle. Say stop when you are done.`,
    'find.notInView': (name) => `No ${name} in view. Keep turning slowly.`,
    'find.left': (name) => `${name}, to your left.`,
    'find.slightLeft': (name) => `${name}, slightly left.`,
    'find.right': (name) => `${name}, to your right.`,
    'find.slightRight': (name) => `${name}, slightly right.`,
    'find.ahead': (name, dist) => `${name}, straight ahead${dist ? `, ${dist}` : ''}.`,
    'find.unknown': (word) => `I can't find ${word} yet. Double tap Find an object in More tools to hear what I can find.`,

    // --- Colour -------------------------------------------------------------------
    'colour.result': (c) => `The color in the middle is ${c}.`,

    // --- Light detector -------------------------------------------------------------
    'light.start': 'Light detector on. Higher beeps mean brighter light. Point the camera around slowly. Say stop when you are done.',
    'light.level': ['Very dark.', 'Dark.', 'Dim light.', 'Normal light.', 'Bright light.', 'Very bright light.'],

    // --- Product -----------------------------------------------------------------------
    'product.start':
      'Scanning for a barcode. Hold the product about 20 centimeters from the camera, and turn it slowly. Barcodes are usually on the back or the bottom.',
    'product.found': 'Barcode found.',
    'product.lookingUp': 'Looking up the product.',
    'product.result': (desc) => `${desc}.`,
    'product.notInDb': (code) => `The barcode is ${code}, but this product is not in the product database.`,
    'product.offline': (code) => `The barcode is ${code}. Looking up the product name needs the internet, which is off or not working.`,
    'product.timeout': 'I could not find a barcode. Try again, and turn the product slowly in front of the camera.',
    'product.codeOnly': (code) => `The barcode is ${code}. Looking up products online is turned off in Settings.`,
    'product.by': 'by',

    // --- Expiry ----------------------------------------------------------------------
    'expiry.reading': 'Looking for a date. Hold still.',
    'expiry.none':
      'I could not find a date. Dates are often printed near the barcode, on the top, or on the bottom. Try another side of the package.',
    'expiry.result': (label, date, when) => `${label} ${date}. ${when}`,
    'expiry.labelExpiry': 'Expiry date:',
    'expiry.labelDate': 'Date found:',
    'expiry.inFuture': (n, unit) => `That is in ${n} ${unit}.`,
    'expiry.inPast': (n, unit) => `That was ${n} ${unit} ago.`,
    'expiry.today': 'That is today.',
    'expiry.units': { day: ['day', 'days'], week: ['week', 'weeks'], month: ['month', 'months'], year: ['year', 'years'] },
    'expiry.ambiguous': (a, b) => `It could mean ${a}, or ${b}.`,
    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],

    // --- Money ----------------------------------------------------------------------
    'money.reading': 'Looking at the money. Hold it flat and still.',
    'money.none': 'I cannot find any money. Hold the bill or coin flat, about 15 centimeters from the camera, and keep still.',
    // Gemini can't answer: money is read on the phone (less accurate). why = one of money.why.*
    'online.localFallback': (why) => `Online reading is not available: ${why}. Using the phone instead, which is less accurate.`,
    'money.why.limit': 'the free online limit is used up for now',
    'money.why.busy': 'the online service is busy',
    'money.why.network': 'there is no internet',
    'money.why.noKey': 'no online model is set up yet; add a key or model in Settings',
    'online.back': 'Online reading is back.',
    // On-screen indicator while the camera is read on the phone instead of online.
    'online.badge': (why, time) =>
      `Reading on phone (${why}). ${time ? `Trying online again at ${time}.` : 'Trying online again on the next reading.'}`,
    // View money: the picture is taken the moment the button is pressed.
    'money.captured': 'Picture taken. You can move the camera now. Reading the money.',
    'btn.readingMoney': 'Reading money…',
    'preview.reading': 'Reading this picture…',
    // Money guide (on the phone only): moves = words from frame.moves, already joined.
    'btn.guide': 'Guide me',
    'hint.guide': 'Tells you how to move the phone until the money is in the middle and close enough. Works on the phone, without internet',
    'mode.moneyGuide': 'money guide',
    'guide.start': 'Money guide. Hold the money about 15 centimeters in front of the camera. I will tell you how to move the phone. When I say ready, press View money.',
    'guide.none': 'No money yet. Hold the money in front of the camera, about 15 centimeters away.',
    'guide.move': (moves) => `Move the phone a little ${moves}.`,
    'guide.moveCloser': (moves) => `Move the phone a little ${moves}, and closer.`,
    'guide.closer': 'Move the phone a little closer.',
    'guide.farther': 'Too close. Move the phone a little farther away.',
    'guide.ready': 'Ready. Hold still and press View money.',
    'guide.timeout': 'Money guide stopped.',
    'money.result': (amount) => `${amount} pesos.`,
    'money.unsure': 'This looks like a peso bill, but I cannot read the amount. Try the other side, or hold it a little farther away.',
    'money.coin': (amount, unit) => (unit === 'sentimo' ? `${amount} centavo coin.` : `${amount} peso coin.`),
    'mode.coin': 'coin reading',
    'coin.start':
      'This looks like a coin. I will keep trying to read it. Hold it flat, about 10 centimeters from the camera, with the big number facing the camera. Say stop to cancel.',
    'coin.flip': 'This is the back of the coin. Turn it over.',
    'coin.closer': 'I can see writing on the coin, but not the number yet. Hold it a little closer, and very still.',
    'coin.tips': [
      'Hold the coin by its edge, or lay it flat on your palm, so your fingers do not cover the number.',
      'Turn on the light. If the coin shines too much, tilt it a little.',
      'Move the phone a little closer, about 10 centimeters from the coin.',
      'Try the other side of the coin.',
    ],
    'coin.giveUp': 'I could not read the coin. Try again in brighter light, or ask someone nearby.',
    'describe.coinHint': 'If it is a coin, use View money to hear its value.',
    // Smart (online) money reading: groups = [{ kind, value, unit, count }], total in sentimo.
    'money.pieces': (groups, total) => {
      const piece = (g) => `${g.value}-${g.unit === 'sentimo' ? 'centavo' : 'peso'} ${g.kind}${g.count > 1 ? 's' : ''}`;
      // Counts as words, so "2 5-peso coins" isn't heard as "25".
      const words = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
      const parts = groups.map((g) => `${words[g.count] ?? g.count} ${piece(g)}`);
      const list = parts.length > 1 ? `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}` : parts[0];
      const count = groups.reduce((n, g) => n + g.count, 0);
      const pesos = Math.floor(total / 100);
      const cents = total % 100;
      const amount = [pesos && `${pesos} ${pesos === 1 ? 'peso' : 'pesos'}`, cents && `${cents} centavos`].filter(Boolean).join(' and ');
      const sentence = `${list.charAt(0).toUpperCase()}${list.slice(1)}.`;
      return count > 1 ? `${sentence} Total: ${amount}.` : sentence;
    },
    'money.problem.too_far': 'I see money, but it is too far. Hold it about 15 centimeters from the camera.',
    'money.problem.partly_hidden': 'Part of the money is covered. Hold it by the edge so your fingers do not cover it.',
    'money.problem.glare': 'There is too much shine on it. Tilt it a little, or turn off the light.',
    'money.problem.unsure': 'I can see money, but I am not sure of the amount. Hold it flat, a little closer, and try again.',
    'money.problem.foreign_money': (currency) => `This is not Philippine money.${currency ? ` It looks like ${currency}.` : ''}`,

    // --- Where am I --------------------------------------------------------------------
    'where.finding': 'Finding where you are.',
    'where.result': (addr) => `You are near ${addr}.`,
    'where.noPermission': 'To say where you are, SeeForMe needs location access. You can allow it in the phone Settings.',
    'where.failed': 'I could not find your location. Make sure location is turned on, and try again.',
    'where.noAddress': 'I found your location, but I cannot find a street address. Looking up the address needs the internet.',
    'where.accuracy': (m) => `Accurate to about ${m} meters.`,

    // --- Share -------------------------------------------------------------------------
    'share.taking': 'Taking a picture to send. Hold still.',
    'share.choose': 'Choose who to send the picture to.',
    'share.unavailable': 'Sharing is not available on this phone.',

    // --- Obstacle ------------------------------------------------------------------------
    'obstacle.start':
      'Obstacle warning on. This is experimental. It can miss glass, thin poles, holes, and steps. Keep using your cane or guide dog. ' +
      'I will vibrate when something seems close ahead. Say stop when you are done.',
    'obstacle.veryNear': 'Stop. Something is very close ahead.',
    'obstacle.near': 'Something ahead.',
    'obstacle.clear': 'Clear ahead.',
    'obstacle.loadError': 'The obstacle model could not load.',

    // --- Shake --------------------------------------------------------------------------
    'shake.describe': 'Shake detected.',

    // --- Settings ---------------------------------------------------------------------------
    'settings.title': 'Settings',
    'settings.opened': (count) =>
      `Settings. ${count} buttons, from top to bottom. Each one says its name and whether it is on or off. Double tap to change it. The Back button is at the bottom.`,
    'settings.toggle': (name, value) => `${name}: ${value ? 'on' : 'off'}`,
    'settings.changed': (name, value) => `${name} ${value ? 'on' : 'off'}.`,
    'settings.rate': (rate) => `Speech speed: ${rate} times`,
    'settings.rateHint': 'Use the Slower and Faster buttons below to change it',
    'settings.slower': 'Slower',
    'settings.faster': 'Faster',
    'settings.rateChanged': (rate) => `Speech speed ${rate} times. This is how fast I talk now.`,
    'settings.language': 'Language: English',
    'settings.languageHint': 'Switches to Filipino',
    'settings.languageChanged': 'Language: English.',
    'settings.section.speech': 'Speech and controls',
    'settings.section.describe': 'Describe',
    'settings.section.tools': 'Tools',
    'settings.section.other': 'Other',
    'settings.section.gemini': 'Online AI',
    'set.useGemini': 'Use online AI',
    // Online AI (Gemini or any OpenAI-compatible model)
    'online.provider': (name) => `Online model: ${name}`,
    'online.provider.gemini': 'Google Gemini',
    'online.provider.custom': 'Custom, OpenAI-compatible',
    'online.providerHint': 'Switches between Google Gemini and your own online model, such as OpenAI, OpenRouter, Groq, or a server on your network',
    'online.switched': (name) => `Online model is now ${name}.`,
    'online.customSet': (model) => `Custom model set: ${model}.`,
    'online.customMissing': 'No custom model yet. Enter the server address and model name, then save. The model must understand pictures.',
    'online.field.url': 'Server address',
    'online.field.url.hint': 'For example https://api.openai.com/v1, or https://openrouter.ai/api/v1',
    'online.field.model': 'Model name',
    'online.field.model.hint': 'A model that understands pictures, for example gpt-4o-mini',
    'online.field.key': 'API key',
    'online.field.key.hint': 'Leave blank for a local server that needs no key, or to keep the saved key',
    'online.save': 'Save and test custom model',
    'online.saveHint': 'Checks the server and model, then saves them on this phone only',
    'online.remove': 'Remove custom model',
    'online.removeHint': 'Deletes the saved server address, model name, and key',
    'online.incomplete': 'Enter a server address starting with http or https, and a model name.',
    'online.invalid': 'The server refused the key. Nothing was saved.',
    'online.notFound': 'The server did not find that address or model name. Nothing was saved.',
    'online.saved': 'Custom model saved and working.',
    'online.savedUnchecked': 'Saved, but the server could not be checked right now.',
    'online.removed': 'Custom model removed.',
    // Own (imported) TensorFlow Lite models
    'settings.section.ownModels': 'My own models',
    'own.money.status': (has) => (has ? 'Your own money model is imported.' : 'No money model imported. Import a .tflite image classifier and its labels file, with labels like 20 piso or 5 sentimo coin.'),
    'own.detector.status': (has) => (has ? 'Your own object model is imported.' : 'No object model imported. Import a .tflite object detector and its labels file to use it for Describe.'),
    'own.money.import': (has) => (has ? 'Replace money model' : 'Import money model'),
    'own.detector.import': (has) => (has ? 'Replace object model' : 'Import object model'),
    'own.money.importHint': 'Pick the .tflite file, then its labels .txt file',
    'own.detector.importHint': 'Pick the .tflite file, then its labels .txt file',
    'own.importing': 'Importing…',
    'own.pick': 'Pick the model file ending in .tflite. Then pick its labels file.',
    'own.imported': (name, n) => `Imported ${name} with ${n} labels.`,
    'own.remove': 'Remove this model',
    'own.money.removeHint': 'Deletes your money model from this phone',
    'own.detector.removeHint': 'Deletes your object model; Describe uses the built-in one again',
    'own.removed': 'Model removed.',
    'own.error.notModel': 'That file is not a .tflite model.',
    'own.error.noLabels': 'The labels file is empty.',
    'own.error.failed': (err) => `The model could not be used on this phone. ${err ?? ''}`,
    'set.ownMoneyModel': 'Use my money model',
    'set.ownMoneyModel.hint': 'When the online model cannot answer, your money model is tried before the built-in reader',
    'set.ownDetector': 'Use my object model',
    'set.ownDetector.hint': 'Describe and other tools use your object model instead of the built-in one',
    'set.useGemini.hint': 'When on, Describe, Live and View money send the photo to the online model (Google Gemini or your own) for a better answer, and use the phone only when it is unavailable or its free limit is used up. When off, everything works on the phone only',
    'gemini.keySet': 'Gemini key: saved on this phone.',
    'gemini.keyBuiltIn': 'Gemini key: using the developer key built into this app.',
    'gemini.keyMissing':
      'No Gemini key yet, so money is read on the phone only. Get a free key at aistudio.google.com/apikey, then paste it in the box below.',
    'gemini.required': 'Read text and View money require Google Gemini. Add a Gemini API key in Settings, then try again.',
    'gemini.field': 'Gemini API key',
    'gemini.fieldHint': 'Paste your key here, then press Save key',
    'gemini.save': 'Save key',
    'gemini.saveHint': 'Checks the key with Google, then saves it on this phone only',
    'gemini.remove': 'Remove key',
    'gemini.removeHint': 'Deletes the saved key; money will be read on the phone',
    'gemini.empty': 'The box is empty. Paste your Gemini key first.',
    'gemini.checking': 'Checking the key.',
    'gemini.saved': 'Key saved. Money will be read online.',
    'gemini.savedUnchecked': 'Key saved, but it could not be checked right now. It will be tried on the next money reading.',
    'gemini.invalid': 'That key did not work, so it was not saved. Check that the whole key was copied.',
    'gemini.removed': 'Key removed. Money will be read on the phone.',
    'set.voiceCommands': 'Voice commands',
    'set.voiceCommands.hint': 'Listen for commands that start with Hey Omni',
    'set.touchToHear': 'Touch to hear buttons',
    'set.touchToHear.hint': 'Without TalkBack or VoiceOver, the first tap says a button name and a double tap uses it',
    'set.brief': 'Short descriptions',
    'set.brief.hint': 'Describe only the nearest three things',
    'set.distances': 'Distances',
    'set.distances.hint': 'Say roughly how far away things are',
    'set.sceneGuess': 'Guess the place',
    'set.sceneGuess.hint': 'Say what kind of place it looks like, such as a kitchen',
    'set.photoWarnings': 'Bad picture warnings',
    'set.photoWarnings.hint': 'Warn when the camera is covered, too dark, or blurry',
    'set.shake': 'Shake to describe',
    'set.shake.hint': 'Shake the phone twice to describe what is in front of you',
    'set.findTool': 'Find an object',
    'set.colourTool': 'Color reader',
    'set.lightTool': 'Light detector',
    'set.productTool': 'Product barcode scanner',
    'set.productOnline': 'Look up products online',
    'set.productOnline.hint': 'Sends the barcode number, not the picture, to the free Open Food Facts database',
    'set.expiryTool': 'Expiry date reader',
    'set.moneyTool': 'Money reader',
    'set.whereTool': 'Where am I',
    'set.shareTool': 'Send picture to a helper',
    'set.obstacleTool': 'Obstacle warning, experimental',
    'set.obstacleTool.hint': 'Can miss glass, poles, holes, and steps. Always keep using your cane or guide dog',

    // --- Permission screen ---------------------------------------------------------------------
    'perm.ask':
      'SeeForMe needs the camera to describe what is in front of you. The screen has one large button, Allow camera, filling the bottom of the screen. Double tap it to allow camera access.',
    'perm.settings':
      'Camera access is turned off. The screen has one large button, Open settings, filling the bottom of the screen. Double tap it to open Settings and turn on the camera for SeeForMe.',
    'perm.allow': 'Allow camera',
    'perm.allowHint': 'Shows the camera permission prompt',
    'perm.open': 'Open settings',
    'perm.openHint': 'Opens the phone settings for this app',

    // --- About ------------------------------------------------------------------------------
    'about.title': 'About SeeForMe',
    credits: [
      'SeeForMe recognizes objects with EfficientDet-Lite0 by Google, used under the Apache License, version 2.0.',
      'The experimental obstacle warning uses MiDaS small by Intel, used under the MIT License.',
      'Text reading uses Google ML Kit on Android and Apple Vision on iOS. Product names come from Open Food Facts, under the Open Database License.',
      'All recognition happens on this phone. Pictures are never uploaded. Only product barcode numbers are looked up online, and you can turn that off.',
      'Distances are rough estimates based on the typical size of each object. Always use your cane, guide dog, or other mobility aids.',
    ],
    'about.spoken': (credits) => `About SeeForMe. ${credits.join(' ')} The only button, Back, is at the bottom of the screen. Double tap it to go back.`,

    // --- Read text ------------------------------------------------------------------------------
    'read.unsupported': 'Reading text is not supported on this phone.',
    'read.none': (torchOn) =>
      "I can't find any text. Hold the phone about 30 centimeters away, straight in front of the text, and keep it steady." +
      (torchOn ? ' The light is on. On shiny screens it causes glare, so try turning it off.' : ' On paper, turn on the light if it is dark.'),
    'read.says': (text) => `The text says: ${text}`,

    // --- Tutorial ---------------------------------------------------------------------------------
    'tut.step': (i, n, title, text) => `Step ${i} of ${n}. ${title}. ${text}`,
    'tut.first': 'This is the first step. Double tap Next to continue, or Skip tutorial at the top to skip it.',
    'tut.voiceHelp': 'During the tutorial, say next, back, repeat, or skip.',
    'tut.progress': (i, n) => `Step ${i} of ${n}`,
    'btn.skipTutorial': 'Skip tutorial',
    'hint.skipTutorial': 'Closes the tutorial and starts the app. You can take it again later from Settings.',
    'hint.back': 'Goes to the previous step',
    'hint.repeatStep': 'Reads this step again',
    'btn.next': 'Next',
    'hint.next': (i, n) => `Goes to step ${i} of ${n}`,
    'btn.startUsing': 'Start using SeeForMe',
    'hint.startUsing': 'Ends the tutorial and opens the camera',
  },

  fil: {
    on: 'bukas',
    off: 'sarado',
    'button.spoken': (label, hint) => `Button na ${label}. ${hint ? `${hint}. ` : ''}I-double tap para gamitin.`,
    'button.notAvailable': (label) => `${label}. Hindi pa ito magagamit ngayon.`,

    'camera.starting': 'Nagsisimula pa ang camera. Pakisubukan ulit mamaya-maya.',
    'camera.error': 'Pasensya na, nagkaproblema sa pagtingin sa larawan. Pakisubukan ulit.',
    'camera.mountError': 'Hindi nagsimula ang camera. Isara ang app at buksan ulit.',
    'model.loadError': 'Hindi na-load ang recognition model. Pakisara at pakibuksan ulit ang app.',
    'status.ready': 'Handa na. Sabihin: "Hey Omni, ano ang nasa camera"',
    'describe.looking': 'Tumitingin. Huwag munang gumalaw.',
    'read.reading': 'Nagbabasa. Huwag munang gumalaw.',
    'repeat.nothing': 'Wala pang uulitin. Gamitin muna ang Describe o Read text.',
    'torch.on': 'Bukas na ang ilaw.',
    'torch.off': 'Sarado na ang ilaw.',
    'torch.alreadyOn': 'Bukas na ang ilaw.',
    'torch.alreadyOff': 'Sarado na ang ilaw.',
    'live.on': 'Bukas na ang Live. Sasabihin ko kapag may nagbago sa nakikita ko. I-double tap ulit ang Live para itigil.',
    'live.off': 'Sarado na ang Live.',
    'live.already': 'Bukas na ang Live.',
    'full.on': 'Full screen na ang camera. Nasa kanang itaas ang Exit full screen.',
    'full.off': 'Normal na view. Nasa pagitan ulit ng mga button sa itaas at ng status ang camera.',
    'full.alreadyOn': 'Naka-full screen na ang camera.',
    'full.alreadyOff': 'Hindi naka-full screen ang camera.',
    'about.back': 'Balik sa camera. I-double tap ang Help sa kaliwang itaas para marinig ang ayos ng screen.',
    'settings.back': 'Balik sa camera.',

    'greet.short':
      'Handa na ang SeeForMe. Ang Describe ang pinakamalaking button, nasa pinakaibaba. Para sa tulong, sabihin: Hey Omni, help. O i-double tap ang Help sa kaliwang itaas.',
    'greet.skipped':
      'Nilaktawan ang tutorial. Puwede mo itong gawin kahit kailan: sabihin, Hey Omni, tutorial. O i-double tap ang Settings, tapos ang Simulan ang tutorial.',
    'layout.full':
      'Full screen na camera. Sakop ng larawan ng camera ang buong screen. Sa itaas, ang huling mensahe. ' +
      'Sa kanang itaas, ang Exit full screen button. ' +
      'Pindutin ang kahit anong button para marinig ang pangalan nito, tapos i-double tap para gamitin.',
    'layout.normal': ({ torch, live, voice, tools, mode }) =>
      'Ayos ng screen, mula itaas hanggang ibaba. ' +
      `Sa itaas, tatlong button: Help sa kaliwa, Voice sa gitna, na ${voice ? 'bukas' : 'sarado'}, at Settings sa kanan. ` +
      'Sa ilalim nila, ang larawan ng camera, may Full screen button sa kanang ibabang sulok nito. ' +
      'Tapos isang linya ng text na nagpapakita ng huling mensahe. ' +
      `Tapos tatlong button na magkakatabi: Repeat sa kaliwa, Light sa gitna, na ${torch ? 'bukas' : 'sarado'}, ` +
      `at Live sa kanan, na ${live ? 'bukas' : 'sarado'}. ` +
      (tools
        ? 'Sa ilalim nila, dalawang malalaking button na magkakatabi: ang berdeng Read text sa kaliwa, at ang pink na Tingnan ang pera sa kanan. '
        : 'Sa ilalim nila, ang malapad na berdeng Read text button. ') +
      (mode ? `Tapos isang malapad na button para itigil ang ${mode}. ` : '') +
      'Available ang Describe gamit ang boses: sabihin, Hey Omni, ano ang nasa camera. ' +
      'Pindutin ang kahit anong button para marinig ang pangalan nito, tapos i-double tap para gamitin.',
    'voice.tutorialOn':
      'Puwede mo ring gamitin ang boses mo, nang hindi hinahawakan ang screen. ' +
      'Sabihin: Hey Omni, ano ang nasa camera. At ilalarawan ko ang nasa harap mo. ' +
      'Sabihin: Hey Omni, basahin mo ito. At babasahin ko ang text. ' +
      'Puwede kang magsalita habang nagsasalita ako. Para patigilin ako, sabihin lang: tigil.',
    'voice.tutorialOff': 'Sarado ang voice commands. I-double tap ang Voice button sa itaas para buksan.',
    'help.buttons':
      'Sinasabi ng Describe kung anong klaseng lugar ito, ang mga bagay sa harap mo, kung nasaan sila, at kung gaano kalayo. ' +
      'Binabasa nang malakas ng Read text ang nakasulat: mga karatula, label, sulat, at screen ng TV, computer at cellphone. Para sa text, ilayo ang phone nang mga 30 sentimetro. ' +
      'Patuloy na naglalarawan ang Live, at nagsasalita kapag may nagbago. ' +
      'Inuulit ng Repeat ang huling resulta. Binubuksan o pinapatay ng Light ang flashlight. ' +
      'Nasa More tools ang iba pang gamit, gaya ng paghanap ng bagay, kulay, pera, at produkto. ' +
      'Sa Settings, puwede mong buksan o patayin ang mga feature, at palitan ang bilis ng pagsasalita at ang wika. ' +
      'Hawakan nang patayo ang phone, nakaharap ang camera sa likod sa gusto mong malaman.',
    'help.voiceCommands':
      'Lahat ng voice command ay nagsisimula sa Hey Omni. ' +
      'Ano ang nasa camera: inilalarawan ang nasa harap mo. Basahin mo ito: binabasa ang nakasulat. ' +
      'Simulan ang live: patuloy na naglalarawan. Tigil: itinitigil ang ginagawa ko at ang pagsasalita ko. ' +
      'Habang nagsasalita ako, o habang may tool na tumatakbo, puwede mong sabihin lang ang tigil, kahit walang Hey Omni. ' +
      'Ulitin. Buksan ang ilaw, o patayin ang ilaw. Full screen, o exit full screen. ' +
      'Basahin ang dokumento: gagabayan ka hanggang makita ang buong pahina, tapos babasahin ito. ' +
      'Hanapin ang tasa, o kahit anong bagay. Anong kulay ito. Magkano ito. Gabayan mo ako: tutulong itutok ang camera sa pera. I-scan ang produkto. Basahin ang expiry. ' +
      'Nasaan ako. Ibahagi ang larawan. Light detector. Obstacle warning. More tools. Settings. ' +
      'Ano ang nasa screen: binabasa ang ayos ng screen. Tulong: binabasa ang mga instruction na ito. Tutorial: sinisimulan ang tutorial. ' +
      'Puwede mo ring sabihin lang ang Hey Omni, hintayin akong sumagot, tapos sabihin ang command.',
    'voice.on': 'Bukas na ang voice commands.',
    'voice.off': 'Sarado na ang voice commands. Hindi na nakikinig ang mikropono.',
    'voice.needMic':
      'Kailangan ng voice commands ang mikropono. Para magamit ito, payagan ang mikropono para sa SeeForMe sa Settings ng phone, tapos i-double tap ang Voice button.',
    'voice.unsupported': 'Hindi magagamit ang voice commands sa phone na ito. Magagamit mo pa rin ang mga button.',
    'voice.wake': 'Ano po iyon?',
    'voice.unknown': 'Pasensya, hindi ko naintindihan. Sabihin: Hey Omni, ano ang nasa camera. O: Hey Omni, tulong.',
    'voice.disabledTool': (name) => `Sarado ang ${name}. Puwede mo itong buksan sa Settings.`,

    'btn.help': 'Help',
    'hint.help': 'Binabasa ang ayos ng screen, ang gamit ng bawat button, at ang mga voice command',
    'btn.voice': (on) => `Voice: ${on ? 'bukas' : 'sarado'}`,
    'hint.voice': (on) => (on ? 'Ititigil ang pakikinig sa Hey Omni' : 'Makikinig sa mga voice command na nagsisimula sa Hey Omni'),
    'btn.settings': 'Settings',
    'hint.settings': 'Buksan o patayin ang mga feature, palitan ang bilis ng pagsasalita at ang wika',
    'btn.repeat': 'Repeat',
    'hint.repeat': 'Inuulit ang huling resulta',
    'btn.light': (on) => `Light: ${on ? 'bukas' : 'sarado'}`,
    'hint.light': (on) => (on ? 'Pinapatay ang flashlight' : 'Binubuksan ang flashlight, nakakatulong sa madilim'),
    'btn.live': (on) => `Live: ${on ? 'bukas' : 'sarado'}`,
    'hint.live': (on) => (on ? 'Ititigil ang awtomatikong paglalarawan' : 'Patuloy na ilalarawan ang nakikita ng camera, tuwing may nagbabago'),
    'btn.readText': 'Read text',
    'btn.reading': 'Nagbabasa…',
    'hint.readText': 'Kukuha ng larawan at babasahin nang malakas ang nakasulat, pati sa screen ng TV, computer at cellphone',
    'btn.more': 'More tools',
    'hint.more': 'Binubuksan ang iba pang gamit: paghanap ng bagay, kulay, pera, produkto, at iba pa',
    'btn.describe': 'Describe',
    'btn.looking': 'Tumitingin…',
    'hint.describe': 'Kukuha ng larawan at sasabihin kung ano ang nasa harap mo, kung nasaan, at kung gaano kalayo',
    'btn.fullScreen': 'Full screen',
    'btn.exitFull': 'Exit full screen',
    'hint.fullScreen': (on) => (on ? 'Babalik sa normal na view na may lahat ng button' : 'Palalakihin ang larawan ng camera sa buong screen'),
    'btn.stopMode': (mode) => `Itigil ang ${mode}`,
    'hint.stopMode': 'Itinitigil ang tool na tumatakbo',
    'btn.close': 'Isara',
    'hint.close': 'Babalik sa camera',
    'btn.back': 'Bumalik',
    'btn.about': 'About',
    'hint.about': 'Mga credit at impormasyon sa kaligtasan',
    'btn.startTutorial': 'Simulan ang tutorial',
    'hint.startTutorial': 'Uulitin ang tutorial nang hakbang-hakbang',

    'mode.find': 'paghahanap',
    'mode.light': 'light detector',
    'mode.obstacle': 'obstacle warning',
    'mode.product': 'pag-scan ng produkto',
    'mode.stopped': (mode) => `Itinigil ang ${mode}.`,
    'mode.busy': 'May ibang tool na tumatakbo. Sabihin muna ang tigil, o i-double tap ang Stop button.',

    'quality.covered': 'Mukhang may nakatakip sa camera. Siguraduhing hindi natatakpan ng daliri mo ang camera sa likod ng phone.',
    'quality.dark': 'Masyadong madilim para makakita. Buksan ang ilaw, o lumipat sa mas maliwanag na lugar.',
    'quality.blurry': 'Malabo ang larawan. Huwag munang igalaw ang phone, tapos subukan ulit.',

    'frame.sides': { left: 'sa kaliwa', right: 'sa kanan', top: 'sa itaas', bottom: 'sa ibaba' },
    'frame.moves': { left: 'pakaliwa', right: 'pakanan', up: 'pataas', down: 'pababa' },
    'frame.and': 'at',
    'frame.cut': (sides, moves) => `May text na naputol ${sides}. Igalaw nang kaunti ang phone ${moves}.`,
    'frame.offCentre': (moves) => `Nasa gilid ng larawan ang text. Igalaw nang kaunti ang phone ${moves}.`,
    'frame.back': 'Mas malaki ang text kaysa sa larawan. Ilayo nang kaunti ang phone.',
    'frame.closer': 'Maliit ang text. Ilapit nang kaunti ang phone.',
    'frame.good': 'Kita na ang lahat ng text. Huwag gumalaw.',
    'frame.tip': (advice) => `Tip: ${advice}`,
    'document.start':
      'Basahin ang dokumento. Hawakan nang pahiga ang phone sa ibabaw ng pahina, mga 30 sentimetro ang layo, nakaharap ang camera sa pahina. ' +
      'Sasabihin ko kung paano igagalaw ang phone hanggang makita ang buong pahina. Tapos babasahin ko ito. Sabihin ang tigil para kanselahin.',
    'document.noText': 'Wala pang text. Hawakan ang phone sa ibabaw ng pahina, mga 30 sentimetro ang layo.',
    'document.reading': 'Kita na ang lahat ng text. Huwag gumalaw. Nagbabasa.',
    'mode.document': 'pagbasa ng dokumento',
    'tool.document': 'Basahin ang dokumento',
    'tool.document.hint': 'Sasabihin kung paano igagalaw ang phone hanggang makita ang buong pahina, tapos babasahin ito',
    'set.documentTool': 'Basahin ang dokumento',
    'set.framingTips': 'Tips sa pagkuha ng text',
    'set.framingTips.hint': 'Pagkatapos magbasa, sasabihin kung may naputol na text at kung saan igagalaw ang phone',
    'settings.section.reading': 'Pagbasa ng text',

    'tools.title': 'More tools',
    'tools.current': (label) => `${label}, nasa tool button mo`,
    'tools.position': (n, total) => `${n} sa ${total}`,
    'hint.toolButton': (hint) => `Ang napili mong tool. ${hint}. Para palitan, pumili ng ibang tool sa More tools`,
    'status.label': (text) => `Huling mensahe: ${text}`,
    'tools.opened': (names) =>
      `More tools. ${names.length} na button, mula itaas hanggang ibaba: ${names.join(', ')}. Nasa ibaba ang Isara.`,
    'tools.none': 'Sarado lahat ng dagdag na tool. Puwede mo silang buksan sa Settings.',
    'tool.find': 'Maghanap ng bagay',
    'tool.find.hint': 'Mas bibilis ang beep habang papalapit sa gitna ng camera ang bagay',
    'tool.colour': 'Anong kulay ito',
    'tool.colour.hint': 'Sasabihin ang kulay sa gitna ng larawan',
    'tool.light': 'Light detector',
    'tool.light.hint': 'Mas mataas ang beep kapag mas maliwanag',
    'tool.product': 'I-scan ang barcode ng produkto',
    'tool.product.hint': 'Babasahin ang pangalan ng produkto mula sa barcode nito',
    'tool.expiry': 'Basahin ang expiry date',
    'tool.expiry.hint': 'Hahanapin ang expiry o best before date sa pakete',
    'tool.money': 'Tingnan ang pera',
    'tool.money.hint': 'Sasabihin kung magkano ang perang papel at barya. Kung online, ipinapadala ang larawan sa Google Gemini; kung walang internet, sa phone babasahin',
    'tool.where': 'Nasaan ako',
    'tool.where.hint': 'Sasabihin ang pinakamalapit na address',
    'tool.share': 'Ipadala ang larawan sa tutulong',
    'tool.share.hint': 'Kukuha ng larawan at puwede mo itong ipadala sa isang tao sa messaging app',
    'tool.obstacle': 'Obstacle warning',
    'tool.obstacle.hint': 'Eksperimental. Magva-vibrate kapag may mukhang malapit sa harap',

    'find.pickTitle': 'Ano ang hahanapin?',
    'find.pickOpened': (names) => `Ano ang hahanapin? ${names.length} na button: ${names.join(', ')}. Nasa ibaba ang Isara.`,
    'find.start': (name) =>
      `Hinahanap ang ${name}. Dahan-dahang umikot. Bibilis ang beep kapag nasa gitna na ito. Sabihin ang tigil kapag tapos ka na.`,
    'find.notInView': (name) => `Walang ${name} na nakikita. Dahan-dahang umikot pa.`,
    'find.left': (name) => `${name}, sa kaliwa mo.`,
    'find.slightLeft': (name) => `${name}, medyo pakaliwa.`,
    'find.right': (name) => `${name}, sa kanan mo.`,
    'find.slightRight': (name) => `${name}, medyo pakanan.`,
    'find.ahead': (name, dist) => `${name}, nasa harap mismo${dist ? `, ${dist}` : ''}.`,
    'find.unknown': (word) => `Hindi ko pa kayang hanapin ang ${word}. I-double tap ang Maghanap ng bagay sa More tools para marinig ang kaya kong hanapin.`,

    'colour.result': (c) => `Ang kulay sa gitna ay ${c}.`,

    'light.start': 'Bukas ang light detector. Mas mataas ang beep, mas maliwanag. Dahan-dahang itutok ang camera sa paligid. Sabihin ang tigil kapag tapos ka na.',
    'light.level': ['Napakadilim.', 'Madilim.', 'Medyo madilim.', 'Normal na liwanag.', 'Maliwanag.', 'Napakaliwanag.'],

    'product.start':
      'Naghahanap ng barcode. Hawakan ang produkto nang mga 20 sentimetro mula sa camera, at dahan-dahang paikutin. Kadalasang nasa likod o ilalim ang barcode.',
    'product.found': 'May nakitang barcode.',
    'product.lookingUp': 'Hinahanap ang produkto.',
    'product.result': (desc) => `${desc}.`,
    'product.notInDb': (code) => `Ang barcode ay ${code}, pero wala ang produktong ito sa product database.`,
    'product.offline': (code) => `Ang barcode ay ${code}. Kailangan ng internet para malaman ang pangalan ng produkto, at mukhang sarado o mahina ito.`,
    'product.timeout': 'Wala akong nakitang barcode. Subukan ulit, at dahan-dahang paikutin ang produkto sa harap ng camera.',
    'product.codeOnly': (code) => `Ang barcode ay ${code}. Sarado sa Settings ang paghahanap ng produkto online.`,
    'product.by': 'gawa ng',

    'expiry.reading': 'Naghahanap ng petsa. Huwag munang gumalaw.',
    'expiry.none':
      'Wala akong nakitang petsa. Kadalasang nakalimbag ang petsa malapit sa barcode, sa itaas, o sa ilalim. Subukan ang ibang gilid ng pakete.',
    'expiry.result': (label, date, when) => `${label} ${date}. ${when}`,
    'expiry.labelExpiry': 'Expiry date:',
    'expiry.labelDate': 'Nakitang petsa:',
    'expiry.inFuture': (n, unit) => `Iyon ay ${n} ${unit} mula ngayon.`,
    'expiry.inPast': (n, unit) => `Iyon ay ${n} ${unit} na ang nakalipas.`,
    'expiry.today': 'Ngayong araw iyon.',
    'expiry.units': { day: ['araw', 'araw'], week: ['linggo', 'linggo'], month: ['buwan', 'buwan'], year: ['taon', 'taon'] },
    'expiry.ambiguous': (a, b) => `Puwedeng ${a}, o ${b}.`,
    months: ['Enero', 'Pebrero', 'Marso', 'Abril', 'Mayo', 'Hunyo', 'Hulyo', 'Agosto', 'Setyembre', 'Oktubre', 'Nobyembre', 'Disyembre'],

    'money.reading': 'Tinitingnan ang pera. Hawakan ito nang patag at huwag igalaw.',
    'money.none': 'Wala akong makitang pera. Hawakan nang patag ang papel o barya, mga 15 sentimetro mula sa camera, at huwag igalaw.',
    'online.localFallback': (why) => `Hindi available ang online na pagbasa: ${why}. Sa phone ko na lang gagawin, pero mas hindi ito tumpak.`,
    'money.why.limit': 'naubos muna ang libreng online na limit',
    'money.why.busy': 'abala ang online na serbisyo',
    'money.why.network': 'walang internet',
    'money.why.noKey': 'wala pang online model; maglagay ng key o model sa Settings',
    'online.back': 'Bumalik na ang online na pagbasa.',
    'online.badge': (why, time) =>
      `Binabasa sa phone (${why}). ${time ? `Susubukan ulit online nang ${time}.` : 'Susubukan ulit online sa susunod na pagbasa.'}`,
    'money.captured': 'Nakuha na ang larawan. Puwede mo nang igalaw ang camera. Binabasa ang pera.',
    'btn.readingMoney': 'Binabasa ang pera…',
    'preview.reading': 'Binabasa ang larawang ito…',
    'btn.guide': 'Gabayan ako',
    'hint.guide': 'Sasabihin kung paano igagalaw ang phone hanggang nasa gitna at sapat na malapit ang pera. Gumagana sa phone, kahit walang internet',
    'mode.moneyGuide': 'gabay sa pera',
    'guide.start': 'Gabay sa pera. Hawakan ang pera mga 15 sentimetro sa harap ng camera. Sasabihin ko kung paano igagalaw ang phone. Kapag sinabi kong handa na, pindutin ang Tingnan ang pera.',
    'guide.none': 'Wala pang pera. Hawakan ang pera sa harap ng camera, mga 15 sentimetro ang layo.',
    'guide.move': (moves) => `Igalaw nang kaunti ang phone ${moves}.`,
    'guide.moveCloser': (moves) => `Igalaw nang kaunti ang phone ${moves}, at ilapit.`,
    'guide.closer': 'Ilapit nang kaunti ang phone.',
    'guide.farther': 'Masyadong malapit. Ilayo nang kaunti ang phone.',
    'guide.ready': 'Handa na. Huwag gumalaw at pindutin ang Tingnan ang pera.',
    'guide.timeout': 'Itinigil ang gabay sa pera.',
    'money.result': (amount) => `${amount} piso.`,
    'money.unsure': 'Mukhang perang papel ito, pero hindi ko mabasa kung magkano. Subukan ang kabilang side, o ilayo nang kaunti.',
    'money.coin': (amount, unit) => (unit === 'sentimo' ? `${amount} sentimong barya.` : `${amount} pisong barya.`),
    'mode.coin': 'pagbasa ng barya',
    'coin.start':
      'Mukhang barya ito. Patuloy kong susubukang basahin. Hawakan ito nang patag, mga 10 sentimetro mula sa camera, nakaharap ang malaking numero. Sabihin ang tigil para huminto.',
    'coin.flip': 'Likod ito ng barya. Baligtarin mo.',
    'coin.closer': 'May nakikita akong sulat sa barya, pero hindi pa ang numero. Ilapit nang kaunti, at huwag igalaw.',
    'coin.tips': [
      'Hawakan ang barya sa gilid, o ipatong nang patag sa palad, para hindi matakpan ng daliri ang numero.',
      'Buksan ang ilaw. Kung masyadong makintab ang barya, ikiling ito nang kaunti.',
      'Ilapit nang kaunti ang phone, mga 10 sentimetro mula sa barya.',
      'Subukan ang kabilang side ng barya.',
    ],
    'coin.giveUp': 'Hindi ko mabasa ang barya. Subukan ulit sa mas maliwanag na lugar, o magtanong sa katabi.',
    'describe.coinHint': 'Kung barya ito, gamitin ang Tingnan ang pera para malaman kung magkano.',
    'money.pieces': (groups, total) => {
      const piece = (g) => `${g.value} ${g.unit === 'sentimo' ? 'sentimong' : 'pisong'} ${g.kind === 'coin' ? 'barya' : 'perang papel'}`;
      const words = ['', 'isang', 'dalawang', 'tatlong', 'apat na', 'limang', 'anim na', 'pitong', 'walong', 'siyam na', 'sampung'];
      const parts = groups.map((g) => `${words[g.count] ?? `${g.count} na`} ${piece(g)}`);
      const list = parts.length > 1 ? `${parts.slice(0, -1).join(', ')} at ${parts[parts.length - 1]}` : parts[0];
      const count = groups.reduce((n, g) => n + g.count, 0);
      const pesos = Math.floor(total / 100);
      const cents = total % 100;
      const amount = [pesos && `${pesos} piso`, cents && `${cents} sentimo`].filter(Boolean).join(' at ');
      const sentence = `${list.charAt(0).toUpperCase()}${list.slice(1)}.`;
      return count > 1 ? `${sentence} Kabuuan: ${amount}.` : sentence;
    },
    'money.problem.too_far': 'May nakikita akong pera, pero masyadong malayo. Ilapit ito mga 15 sentimetro mula sa camera.',
    'money.problem.partly_hidden': 'May natatakpan sa pera. Hawakan ito sa gilid para hindi matakpan ng daliri.',
    'money.problem.glare': 'Masyadong makintab. Ikiling nang kaunti, o patayin ang ilaw.',
    'money.problem.unsure': 'May nakikita akong pera, pero hindi ako sigurado kung magkano. Hawakan nang patag, ilapit nang kaunti, at subukan ulit.',
    'money.problem.foreign_money': (currency) => `Hindi ito perang Pilipino.${currency ? ` Mukhang ${currency} ito.` : ''}`,

    'where.finding': 'Hinahanap kung nasaan ka.',
    'where.result': (addr) => `Malapit ka sa ${addr}.`,
    'where.noPermission': 'Para masabi kung nasaan ka, kailangan ng SeeForMe ang location. Puwede mo itong payagan sa Settings ng phone.',
    'where.failed': 'Hindi ko mahanap ang lokasyon mo. Siguraduhing bukas ang location, at subukan ulit.',
    'where.noAddress': 'Nahanap ko ang lokasyon mo, pero hindi ko mahanap ang address. Kailangan ng internet para dito.',
    'where.accuracy': (m) => `Tama hanggang mga ${m} metro.`,

    'share.taking': 'Kumukuha ng larawan na ipapadala. Huwag munang gumalaw.',
    'share.choose': 'Piliin kung kanino ipapadala ang larawan.',
    'share.unavailable': 'Hindi puwedeng mag-share sa phone na ito.',

    'obstacle.start':
      'Bukas ang obstacle warning. Eksperimental pa ito. Puwede nitong hindi mapansin ang salamin, manipis na poste, butas, at hagdan. Patuloy na gamitin ang tungkod o guide dog mo. ' +
      'Magva-vibrate ako kapag may mukhang malapit sa harap. Sabihin ang tigil kapag tapos ka na.',
    'obstacle.veryNear': 'Tigil. May napakalapit sa harap.',
    'obstacle.near': 'May nasa harap.',
    'obstacle.clear': 'Maluwag sa harap.',
    'obstacle.loadError': 'Hindi na-load ang obstacle model.',

    'shake.describe': 'Naramdaman ang pag-alog.',

    'settings.title': 'Settings',
    'settings.opened': (count) =>
      `Settings. ${count} na button, mula itaas hanggang ibaba. Sinasabi ng bawat isa ang pangalan nito at kung bukas o sarado. I-double tap para palitan. Nasa ibaba ang Bumalik.`,
    'settings.toggle': (name, value) => `${name}: ${value ? 'bukas' : 'sarado'}`,
    'settings.changed': (name, value) => `${name}, ${value ? 'bukas na' : 'sarado na'}.`,
    'settings.rate': (rate) => `Bilis ng pagsasalita: ${rate} beses`,
    'settings.rateHint': 'Gamitin ang Mas mabagal at Mas mabilis na button sa ilalim para palitan',
    'settings.slower': 'Mas mabagal',
    'settings.faster': 'Mas mabilis',
    'settings.rateChanged': (rate) => `Bilis ng pagsasalita, ${rate} beses. Ganito na kabilis ang pagsasalita ko.`,
    'settings.language': 'Wika: Filipino',
    'settings.languageHint': 'Lilipat sa English',
    'settings.languageChanged': 'Wika: Filipino.',
    'settings.section.speech': 'Pagsasalita at kontrol',
    'settings.section.describe': 'Describe',
    'settings.section.tools': 'Mga tool',
    'settings.section.other': 'Iba pa',
    'settings.section.gemini': 'Online AI',
    'set.useGemini': 'Gamitin ang online AI',
    'online.provider': (name) => `Online model: ${name}`,
    'online.provider.gemini': 'Google Gemini',
    'online.provider.custom': 'Sarili, OpenAI-compatible',
    'online.providerHint': 'Lumilipat sa pagitan ng Google Gemini at sarili mong online model, gaya ng OpenAI, OpenRouter, Groq, o server sa network mo',
    'online.switched': (name) => `Ang online model ay ${name} na.`,
    'online.customSet': (model) => `Naka-set ang sariling model: ${model}.`,
    'online.customMissing': 'Wala pang sariling model. Ilagay ang address ng server at pangalan ng model, saka i-save. Dapat nakakaintindi ng larawan ang model.',
    'online.field.url': 'Address ng server',
    'online.field.url.hint': 'Halimbawa https://api.openai.com/v1, o https://openrouter.ai/api/v1',
    'online.field.model': 'Pangalan ng model',
    'online.field.model.hint': 'Model na nakakaintindi ng larawan, halimbawa gpt-4o-mini',
    'online.field.key': 'API key',
    'online.field.key.hint': 'Iwanang blangko kung lokal na server na walang key, o para panatilihin ang naka-save na key',
    'online.save': 'I-save at subukan ang sariling model',
    'online.saveHint': 'Sinusuri ang server at model, saka sine-save sa phone na ito lang',
    'online.remove': 'Alisin ang sariling model',
    'online.removeHint': 'Binubura ang naka-save na address, pangalan ng model, at key',
    'online.incomplete': 'Maglagay ng address na nagsisimula sa http o https, at pangalan ng model.',
    'online.invalid': 'Tinanggihan ng server ang key. Walang na-save.',
    'online.notFound': 'Hindi nahanap ng server ang address o model. Walang na-save.',
    'online.saved': 'Na-save at gumagana ang sariling model.',
    'online.savedUnchecked': 'Na-save, pero hindi masuri ang server ngayon.',
    'online.removed': 'Naalis ang sariling model.',
    'settings.section.ownModels': 'Sarili kong mga model',
    'own.money.status': (has) => (has ? 'Naka-import ang sarili mong money model.' : 'Walang naka-import na money model. Mag-import ng .tflite image classifier at labels file nito, na may label gaya ng 20 piso o 5 sentimo coin.'),
    'own.detector.status': (has) => (has ? 'Naka-import ang sarili mong object model.' : 'Walang naka-import na object model. Mag-import ng .tflite object detector at labels file nito para magamit sa Describe.'),
    'own.money.import': (has) => (has ? 'Palitan ang money model' : 'Mag-import ng money model'),
    'own.detector.import': (has) => (has ? 'Palitan ang object model' : 'Mag-import ng object model'),
    'own.money.importHint': 'Piliin ang .tflite file, saka ang labels .txt file nito',
    'own.detector.importHint': 'Piliin ang .tflite file, saka ang labels .txt file nito',
    'own.importing': 'Ini-import…',
    'own.pick': 'Piliin ang model file na nagtatapos sa .tflite. Saka piliin ang labels file nito.',
    'own.imported': (name, n) => `Na-import ang ${name}, may ${n} na label.`,
    'own.remove': 'Alisin ang model na ito',
    'own.money.removeHint': 'Binubura ang money model mo sa phone na ito',
    'own.detector.removeHint': 'Binubura ang object model mo; babalik sa built-in ang Describe',
    'own.removed': 'Naalis ang model.',
    'own.error.notModel': 'Hindi .tflite model ang file na iyan.',
    'own.error.noLabels': 'Walang laman ang labels file.',
    'own.error.failed': (err) => `Hindi magamit ang model sa phone na ito. ${err ?? ''}`,
    'set.ownMoneyModel': 'Gamitin ang money model ko',
    'set.ownMoneyModel.hint': 'Kapag hindi makasagot ang online model, susubukan muna ang money model mo bago ang built-in',
    'set.ownDetector': 'Gamitin ang object model ko',
    'set.ownDetector.hint': 'Gagamitin ng Describe at iba pang tool ang object model mo sa halip na ang built-in',
    'set.useGemini.hint': 'Kapag naka-on, ipinapadala ng Describe, Live at Tingnan ang pera ang larawan sa online model (Google Gemini o sarili mo) para mas tama ang sagot, at sa phone lang kapag hindi ito available o naubos ang libreng limit. Kapag naka-off, sa phone lang gagana ang lahat',
    'gemini.keySet': 'Gemini key: naka-save sa phone na ito.',
    'gemini.keyBuiltIn': 'Gemini key: ginagamit ang developer key na kasama sa app.',
    'gemini.keyMissing':
      'Wala pang Gemini key, kaya sa phone lang babasahin ang pera. Kumuha ng libreng key sa aistudio.google.com/apikey, tapos i-paste sa kahon sa ibaba.',
    'gemini.required': 'Kailangan ng Google Gemini ang Read text at Tingnan ang pera. Maglagay ng Gemini API key sa Settings, tapos subukan ulit.',
    'gemini.field': 'Gemini API key',
    'gemini.fieldHint': 'I-paste dito ang key mo, tapos pindutin ang I-save ang key',
    'gemini.save': 'I-save ang key',
    'gemini.saveHint': 'Susuriin ang key sa Google, tapos ise-save sa phone na ito lang',
    'gemini.remove': 'Alisin ang key',
    'gemini.removeHint': 'Buburahin ang naka-save na key; sa phone na babasahin ang pera',
    'gemini.empty': 'Walang laman ang kahon. I-paste muna ang Gemini key mo.',
    'gemini.checking': 'Sinusuri ang key.',
    'gemini.saved': 'Na-save ang key. Online nang babasahin ang pera.',
    'gemini.savedUnchecked': 'Na-save ang key, pero hindi ito masuri ngayon. Susubukan ito sa susunod na pagbasa ng pera.',
    'gemini.invalid': 'Hindi gumana ang key, kaya hindi ito na-save. Siguraduhing buo ang nakopya.',
    'gemini.removed': 'Naalis ang key. Sa phone na babasahin ang pera.',
    'set.voiceCommands': 'Voice commands',
    'set.voiceCommands.hint': 'Makinig sa mga command na nagsisimula sa Hey Omni',
    'set.touchToHear': 'Pindutin para marinig ang button',
    'set.touchToHear.hint': 'Kapag walang TalkBack o VoiceOver, sinasabi ng unang pindot ang pangalan ng button at ginagamit ito ng double tap',
    'set.brief': 'Maikling paglalarawan',
    'set.brief.hint': 'Ilarawan lang ang tatlong pinakamalapit',
    'set.distances': 'Layo',
    'set.distances.hint': 'Sabihin kung gaano kalayo ang mga bagay',
    'set.sceneGuess': 'Hulaan ang lugar',
    'set.sceneGuess.hint': 'Sabihin kung anong klaseng lugar ito, gaya ng kusina',
    'set.photoWarnings': 'Babala sa pangit na larawan',
    'set.photoWarnings.hint': 'Magbabala kapag natatakpan, masyadong madilim, o malabo ang camera',
    'set.shake': 'Alugin para mag-describe',
    'set.shake.hint': 'Alugin nang dalawang beses ang phone para ilarawan ang nasa harap mo',
    'set.findTool': 'Maghanap ng bagay',
    'set.colourTool': 'Pagbasa ng kulay',
    'set.lightTool': 'Light detector',
    'set.productTool': 'Barcode scanner ng produkto',
    'set.productOnline': 'Hanapin online ang produkto',
    'set.productOnline.hint': 'Ipinapadala ang numero ng barcode, hindi ang larawan, sa libreng Open Food Facts database',
    'set.expiryTool': 'Pagbasa ng expiry date',
    'set.moneyTool': 'Pagbasa ng pera',
    'set.whereTool': 'Nasaan ako',
    'set.shareTool': 'Ipadala ang larawan sa tutulong',
    'set.obstacleTool': 'Obstacle warning, eksperimental',
    'set.obstacleTool.hint': 'Puwedeng hindi mapansin ang salamin, poste, butas, at hagdan. Patuloy na gamitin ang tungkod o guide dog',

    'perm.ask':
      'Kailangan ng SeeForMe ang camera para ilarawan ang nasa harap mo. May isang malaking button ang screen, Allow camera, sa ibabang bahagi. I-double tap ito para payagan ang camera.',
    'perm.settings':
      'Sarado ang camera para sa app na ito. May isang malaking button ang screen, Open settings, sa ibabang bahagi. I-double tap ito para buksan ang Settings at payagan ang camera para sa SeeForMe.',
    'perm.allow': 'Allow camera',
    'perm.allowHint': 'Ipapakita ang tanong para payagan ang camera',
    'perm.open': 'Open settings',
    'perm.openHint': 'Bubuksan ang settings ng phone para sa app na ito',

    'about.title': 'Tungkol sa SeeForMe',
    credits: [
      'Kinikilala ng SeeForMe ang mga bagay gamit ang EfficientDet-Lite0 ng Google, sa ilalim ng Apache License, version 2.0.',
      'Gumagamit ang eksperimental na obstacle warning ng MiDaS small ng Intel, sa ilalim ng MIT License.',
      'Gumagamit ang pagbasa ng text ng Google ML Kit sa Android at Apple Vision sa iOS. Galing sa Open Food Facts ang mga pangalan ng produkto, sa ilalim ng Open Database License.',
      'Sa phone na ito ginagawa ang lahat ng pagkilala. Hindi kailanman ina-upload ang mga larawan. Ang numero lang ng barcode ang hinahanap online, at puwede mo itong patayin.',
      'Tantiya lang ang layo, batay sa karaniwang laki ng bawat bagay. Palaging gamitin ang tungkod, guide dog, o iba pang pantulong sa paglalakad.',
    ],
    'about.spoken': (credits) => `Tungkol sa SeeForMe. ${credits.join(' ')} Isa lang ang button, Bumalik, nasa ibaba ng screen. I-double tap ito para bumalik.`,

    'read.unsupported': 'Hindi kaya ng phone na ito ang pagbasa ng text.',
    'read.none': (torchOn) =>
      'Wala akong makitang text. Hawakan ang phone nang mga 30 sentimetro ang layo, diretso sa harap ng text, at huwag igalaw.' +
      (torchOn
        ? ' Bukas ang ilaw. Sa makinang na screen, nagdudulot ito ng silaw, kaya subukang patayin.'
        : ' Sa papel, buksan ang ilaw kung madilim.'),
    'read.says': (text) => `Ang nakasulat: ${text}`,

    'tut.step': (i, n, title, text) => `Hakbang ${i} ng ${n}. ${title}. ${text}`,
    'tut.first': 'Ito ang unang hakbang. I-double tap ang Susunod para magpatuloy, o ang Laktawan ang tutorial sa itaas.',
    'tut.voiceHelp': 'Habang nasa tutorial, sabihin ang susunod, bumalik, ulitin, o laktawan.',
    'tut.progress': (i, n) => `Hakbang ${i} ng ${n}`,
    'btn.skipTutorial': 'Laktawan ang tutorial',
    'hint.skipTutorial': 'Isasara ang tutorial at sisimulan ang app. Puwede mo itong ulitin mamaya sa Settings.',
    'hint.back': 'Babalik sa nakaraang hakbang',
    'hint.repeatStep': 'Babasahin ulit ang hakbang na ito',
    'btn.next': 'Susunod',
    'hint.next': (i, n) => `Pupunta sa hakbang ${i} ng ${n}`,
    'btn.startUsing': 'Simulan ang SeeForMe',
    'hint.startUsing': 'Tatapusin ang tutorial at bubuksan ang camera',
  },
};
