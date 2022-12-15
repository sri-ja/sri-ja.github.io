window.onload = () => {
	typeName();
};

let nameIndex = 0;
const name = "Srija Mukhopadhyay";
const speed = 80;

const typeName = () => {
	if (nameIndex < name.length) {
		document.getElementById("nameplace").innerHTML += name.charAt(nameIndex);
		nameIndex++;
		setTimeout(typeName, speed);
	}
};

const content = ["CS Student.", "Lingu.", "Dog Lover.", "Learner."];

let part = 0;

let partIndex = 0;

let internalVal;

const textPlace = document.querySelector("#textplace");

const cursor = document.querySelector("#cursor");

function Type() {
	let text = content[part].substring(0, partIndex + 1);
	textPlace.innerHTML = text;
	partIndex++;

	if (text === content[part]) {
		cursor.style.display = "none";

		clearInterval(internalVal);
		setTimeout(function () {
			internalVal = setInterval(Delete, 50);
		}, 1000);
	}
}

function Delete() {
	let text = content[part].substring(0, partIndex - 1);
	textPlace.innerHTML = text;
	partIndex--;

	if (text === "") {
		clearInterval(internalVal);

		if (part == content.length - 1) part = 0;
		else part++;

		partIndex = 0;

		setTimeout(function () {
			cursor.style.display = "inline-block";
			internalVal = setInterval(Type, 100);
		}, 200);
	}
}

internalVal = setInterval(Type, 100);
