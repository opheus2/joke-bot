const voiceSelect = document.querySelector("select");
const button = document.querySelector(".action");
var synth = window.speechSynthesis;
var voices = [];
let text;
let firsttime = true;

// new speech recognition object
var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
var recognition = new SpeechRecognition();

recognition.continuous = true; //keep voice listening open

// This runs when the speech recognition service starts
recognition.onstart = function() {
    console.log("We are listening. Try speaking into the microphone.");
};

recognition.onspeechend = function() {
    // when user is done speaking
    console.log("You stopped talking.");
    recognition.stop();
};

// This runs when the speech recognition service returns result
recognition.onresult = function(event) {
    var transcript = event.results[0][0].transcript;

    if (
        transcript == "tell me a joke" ||
        transcript == "tell me joke" ||
        transcript == "tell joke" ||
        transcript == "say a joke" ||
        transcript == "say joke" ||
        transcript.includes("joke")
    ) {
        generateJoke();
    }
};


function populateVoiceList() {

    //sort the avaialble list from bottom to top
    voices = synth.getVoices().sort(function(a, b) {
        const aname = a.name.toUpperCase(),
            bname = b.name.toUpperCase();
        if (aname > bname) return -1;
        else if (aname == bname) return 0;
        else return +1;
    });
    var selectedIndex =
        voiceSelect.selectedIndex < 0 ? 0 : voiceSelect.selectedIndex;
    voiceSelect.innerHTML = "";
    for (i = 0; i < voices.length; i++) {
        var option = document.createElement("option");
        option.textContent = voices[i].name + " (" + voices[i].lang + ")";

        if (voices[i].default) {
            option.textContent += " -- DEFAULT";
        }

        option.setAttribute("data-lang", voices[i].lang);
        option.setAttribute("data-name", voices[i].name);
        voiceSelect.appendChild(option);
    }
    voiceSelect.selectedIndex = selectedIndex;
}


if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = populateVoiceList;
}

function speak(text) {
    if (synth.speaking) {
        console.error("speechSynthesis.speaking");
        return;
    }
    if (text) {

        //instantiate the speech with the text
        var utterThis = new SpeechSynthesisUtterance(text);

        //show error in console if any
        utterThis.onerror = function(event) {
            console.error("SpeechSynthesisUtterance.onerror");
        };

        //get the selected voice
        var selectedOption =
            voiceSelect.selectedOptions[0].getAttribute("data-name");
        for (i = 0; i < voices.length; i++) {
            if (voices[i].name === selectedOption) {
                utterThis.voice = voices[i];
                break;
            }
        }

        //speak the word using the selected voice
        synth.speak(utterThis);
    }
}

async function generateJoke() {
    const jokeRes = await fetch(
        "https://official-joke-api.appspot.com/jokes/programming/random"
    );
    let joke = await jokeRes.json();
    joke = `${joke[0].setup} ${joke[0].punchline}`;

    speak(joke);
}

let storage = window.sessionStorage;

window.addEventListener("load", function() {
    window.addEventListener("keypress", (e) => {
        if (e.key == "j" || e.key == "J") {
            generateJoke();
        }
    });

    button.addEventListener("click", () => {
        generateJoke();
    });

    if (!storage.getItem("instructions")) {
        let instructions =
            'Hi, I would Like to teach you how to use me. You can say "tell me a joke" or press the letter "J" or simply press the "tell me a joke" button to get a joke';
        storage.setItem("instructions", instructions);
        speak(instructions);
    }

    populateVoiceList();

    // start recognition
    recognition.start();
});