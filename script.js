window.addEventListener('DOMContentLoaded', () => {

  const burgerMenu = document.querySelector(".burger-menu");
  const container = document.querySelector(".container_2");

  burgerMenu.addEventListener("click", function() {
    container.classList.toggle("active");
  });
  const toolbarOptions = [
    // Existing toolbar options
    ['bold', 'italic', 'underline', 'strike'],
    ['blockquote', 'code-block'],
    [ { 'header': 2 }],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    [{ 'script': 'sub' }, { 'script': 'super' }],
    [{ 'indent': '-1' }, { 'indent': '+1' }],
    [{ 'size': ['small', false, 'large', 'huge'] }],
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'font': [] }],
    [{ 'align': [] }],
    ['link', 'image'],
    ['clean'],
  ];

  Quill.register('modules/counter', function (quill, options) {
    const container = document.querySelector(options.container);
    const progressBarFill = document.getElementById('progress-fill');
    const goalCount = parseInt(document.getElementById('goalCount').textContent);

    

    quill.on('text-change', function () {
      const text = quill.getText();
      const wordCount = text.trim().split(/\s+/).length;

      if (options.unit === 'word') {
        container.innerText = wordCount + '/' + goalCount;
        const progressPercentage = Math.min((wordCount / goalCount) * 100, 100);
        progressBarFill.style.width = progressPercentage + '%';
      } else {
        container.innerText = text.length + ' characters';
      }
    });
  });


  


  const editor = new Quill('#editor', {
    theme: 'snow',
    modules: {
      toolbar: toolbarOptions,
      counter: {
        container: '#counter',
        progressBar: '#progress-bar',
        unit: 'word',
      },
    },
    placeholder: 'Start Typing...',
    size: 30,
  });

  
  const italicizeButton = document.getElementById('italicizeButton');
  const italicizeInput = document.getElementById('italicizeInput');
  
  italicizeButton.addEventListener('click', function () {
    const word = italicizeInput.value.trim();
  
    if (word !== '') {
      const content = editor.getContents();
      const ops = [];
      let matchFound = false;
  
      content.ops.forEach(function (op) {
        if (typeof op.insert === 'string') {
          const regex = new RegExp('\\b' + word + '\\b', 'gi');
          let insert = op.insert;
          let retain = 0;
          let match;
  
          while ((match = regex.exec(op.insert)) !== null) {
            matchFound = true;
            const startIndex = match.index;
            const endIndex = match.index + match[0].length;
  
            if (startIndex > retain) {
              ops.push({ retain: startIndex - retain });
            }
  
            ops.push({ retain: match[0].length, attributes: { italic: true } });
  
            retain = endIndex;
          }
  
          if (retain < insert.length) {
            ops.push({ retain: insert.length - retain });
          }
        } else {
          ops.push(op);
        }
      });
  
      if (matchFound) {
        editor.updateContents({ ops });
        italicizeInput.value = '';
        editor.focus();
      } else {
        window.alert('No matching word found.');
      }
    }
  });
  

  


  function convertToTitleCase(text) {
    return new Promise((resolve, reject) => {
      // Define an array of words that should not be capitalized
      const excludedWords = [
        'a',
        'an',
        'the',
        'and',
        'but',
        'or',
        'nor',
        'at',
        'by',
        'for',
        'in',
        'of',
        'on',
        'to',
        'up',
        'as',
      ];

      // Split the text into individual words
      const words = text.toLowerCase().split(' ');

      // Apply proper title case formatting to each word
      const titleCaseWords = words.map((word, index) => {
        if (index === 0 || !excludedWords.includes(word)) {
          // Capitalize the word if it is the first word or not in the excluded list
          return word.charAt(0).toUpperCase() + word.slice(1);
        } else {
          // Leave the word as it is if it is in the excluded list
          return word;
        }
      });

      // Join the words back into a single string
      const titleCaseText = titleCaseWords.join(' ');

      resolve(titleCaseText);
    });
  }

  function handleTitleCase() {
    const range = editor.getSelection();
    if (range && range.length > 0) {
      const selectedText = editor.getText(range.index, range.length);
      convertToTitleCase(selectedText)
        .then((titleCaseText) => {
          editor.insertText(range.index, titleCaseText, { 'title-case': true });
          editor.deleteText(range.index + titleCaseText.length, range.length);
          console.log('Text converted to title case:', titleCaseText);
        })
        .catch((error) => {
          console.error(error);
        });
    } else {
      console.log('No text selected.');
    }
  }
  
  

  const customButton = document.querySelector('#custom-button');
  customButton.addEventListener('click', function () {
    handleTitleCase();
  });
  const textFileList = document.getElementById("textFileList");
  
  const saveButton = document.getElementById("saveButton");

  // Global variables to keep track of the current file and file list
  let currentFile = null;
  const fileList = [];

  // Function to rename a file
  function renameFile(file) {
    const newName = prompt("Enter new file name:", file.name);
    if (newName && newName !== file.name) {
      const existingFile = fileList.find((f) => f.name === newName);
      if (existingFile) {
        alert("A file with the same name already exists.");
        return;
      }

      const previousName = file.name;
      file.name = newName;
      renderFileList();

      // Update the file name in local storage
      const fileContent = localStorage.getItem(previousName);
      if (fileContent) {
        localStorage.removeItem(previousName);
        localStorage.setItem(newName, fileContent);
      }
    }
  }



    function renderFileList() {
      textFileList.innerHTML = "";

      for (const file of fileList) {
        const fileItem = document.createElement("div");
        fileItem.classList.add("file-item");
        if (file === currentFile) {
          fileItem.classList.add("active");
        }

        const titleSpan = document.createElement("span");
        titleSpan.classList.add("file-title");
        titleSpan.innerText = file.name;
        titleSpan.addEventListener("click", () => {
          selectFile(file);
        });

        const renameIcon = document.createElement("span");
        renameIcon.classList.add("rename-icon");
        renameIcon.innerHTML = "&#9998;";
        renameIcon.addEventListener("click", (event) => {
          event.stopPropagation();
          renameFile(file);
        });

        const deleteIcon = document.createElement("span");
        deleteIcon.classList.add("delete-icon");
        deleteIcon.innerHTML = "&#10006;";
        deleteIcon.addEventListener("click", (event) => {
          event.stopPropagation();
          deleteFile(file);
        });

        
        textFileList.appendChild(fileItem);
      
        fileItem.appendChild(titleSpan);
        fileItem.appendChild(renameIcon);
        fileItem.appendChild(deleteIcon);
      }
    }









    function selectFile(file) {
      if (currentFile) {
        const fileContent = editor.root.innerHTML;
        currentFile.content = fileContent;
        localStorage.setItem(currentFile.name, fileContent);
      }
      
      currentFile = file;
      renderFileList();

      if (file) {
        const fileContent = file.content || "";
        editor.root.innerHTML = fileContent;
      } else {
        editor.root.innerHTML = "";
      }
    }

    // Function to delete a file
    function deleteFile(file) {
      const fileIndex = fileList.findIndex((f) => f === file);
      if (fileIndex > -1) {
        fileList.splice(fileIndex, 1);
        if (file === currentFile) {
          currentFile = null;
          editor.root.innerHTML = "";
        }
        renderFileList();
        // Code to delete the file from local storage...
        localStorage.removeItem(file.name);
      }
    }

    // Function to create a new file
    function createNewFile() {
      const fileName = prompt("Enter file name:");
      if (fileName) {
        const newFile = {
          name: fileName,
          content: ""
        };
        fileList.push(newFile);
        selectFile(newFile);
        saveFile()
      }
    }

    // Function to save the current file
    function saveFile() {
      if (currentFile) {
        const fileContent = editor.root.innerHTML;
        currentFile.content = fileContent;
        localStorage.setItem(currentFile.name, fileContent);
        console.log('File saved:', currentFile);
      }
    }

    // Function to handle the beforeunload event
    function handleBeforeUnload(event) {
      if (currentFile) {
        const fileContent = editor.root.innerHTML;
        currentFile.content = fileContent;
        localStorage.setItem(currentFile.name, fileContent);
      }
      event.preventDefault();
    }

    // Attach the event listener for beforeunload
    window.addEventListener('beforeunload', handleBeforeUnload);
    loadFilesFromLocalStorage();

    // Event listeners
    document.getElementById("newButton").addEventListener("click", createNewFile);
    saveButton.addEventListener('click', saveFile);
    // Initialize the file list
    renderFileList();



  
    // Function to load files from local storage
    function loadFilesFromLocalStorage() {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const content = localStorage.getItem(key);
        if (content) {
          const file = {
            name: key,
            content: content
          };
          fileList.push(file);
        }
      }
      renderFileList();
    }
  

  const confettiCanvas = document.getElementById('confetti');
  const confettiContext = confettiCanvas.getContext('2d');
  const confettiPieces = [];
  const popup = document.getElementById('popup');
  const okButton = document.getElementById('okButton');

  popup.style.display = 'none';

  okButton.addEventListener('click', () => {
    popup.style.display = 'none';
  });

  function celebrate() {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;

    for (let i = 0; i < 200; i++) {
      confettiPieces.push(createConfettiPiece());
    }

    popup.style.display = '';
    popup.classList.remove('hidden');
    animateConfetti();
  }

  function createConfettiPiece() {
    const colors = ['#ff6384', '#36a2eb', '#cc65fe', '#ffce56'];
    const size = Math.random() * 30 + 15;
    const x = Math.random() * confettiCanvas.width;
    const y = Math.random() * confettiCanvas.height / 2;

    return {
      color: colors[Math.floor(Math.random() * colors.length)],
      size,
      x,
      y,
      rotation: Math.random() * 360,
      speedX: Math.random() * 6 - 3,
      speedY: Math.random() * 4 + 2,
    };
  }

  function animateConfetti() {
    confettiContext.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

    confettiPieces.forEach((piece) => {
      piece.y += piece.speedY * 0.75;
      piece.x += piece.speedX;
      piece.rotation += Math.random() * 4;

      confettiContext.beginPath();
      confettiContext.moveTo(piece.x, piece.y);
      confettiContext.lineTo(
        piece.x + piece.size * Math.cos((piece.rotation * Math.PI) / 180),
        piece.y + piece.size * Math.sin((piece.rotation * Math.PI) / 180)
      );
      confettiContext.strokeStyle = piece.color;
      confettiContext.lineWidth = piece.size / 10;
      confettiContext.stroke();
    });

    requestAnimationFrame(animateConfetti);
  }


  function showMessage(message) {
    const messageElement = document.getElementById('message');
    messageElement.textContent = message;
    messageElement.style.display = 'block';
  }

 
  const content = editor.root.innerHTML;
  console.log(content);
  
  

});
