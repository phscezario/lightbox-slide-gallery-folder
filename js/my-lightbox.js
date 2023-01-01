/**
 * Plugin criado por:
 * Paulo Cezario
 * https://github.com/phscezario
 **/

 window.onload = function() {
    // Globais
    let lb, imgContainer, img, width, height, Left, right, galleryIndex, loader;

    // Globais para pré load
    let loaded = 0;
    let loading = false;

    // Verifica se é mobile 
    const isMobile  = Boolean(document.body.clientWidth < 600);

    //let gallery
    let thumbs = [];
    let isGallery = false;

    // Verifica clique
    let clicked = false;

    document.querySelectorAll('[rel^="mylightbox"]').forEach(element => {
        const data = {
            galleryName: element.getAttribute('rel'),
            directory: element.getAttribute('data-directory'),
            type: element.getAttribute('data-type'),
            length: Number(element.getAttribute('data-length')),
            play: element.getAttribute('data-play'),
            seconds: Number(element.getAttribute('data-playseconds'))
        }  
        if(data.play == 'yes') play(element, data);  
        listener(element, data);
    });

    // Add listener
    function listener(element, data) {
        let onPoint;
        let startX;
        
        element.addEventListener('mousedown', e => {
            startX = e.pageX - element.offsetLeft; // Define local do click no eixo X        
        });

        element.addEventListener('mouseup', e => {
            if(startX == e.pageX - element.offsetLeft) onPoint = true;
            else onPoint = false;
        });

        element.addEventListener('click', e => {
            preventEvent(e);
            if(onPoint){
                if(data.galleryName == 'mylightbox' || data == 'thumbnails') showLightbox(element, null);
                else setGallery(element, data);
            }
            
        });
    }

    // Trocar imagens de galeria oculta
    function play(element, data) {
        const milliseconds = data.seconds * 1000;

        // Fade 
        setTimeout( () => {
            element.style.opacity = '0';
        }, milliseconds);

        // Mudar imagem
        setTimeout( () => {
            let random = Math.floor(Math.random() * data.length) + 1;
            let dir = `${data.directory}/${random}.${data.type}`;

            element.setAttribute('href', dir);
            element.childNodes[1].setAttribute('src', dir);
            element.childNodes[1].onload = fadeOut();
        }, milliseconds * 1.2);

        // Fazer imagem aparecer apenas depois de carregar
        let fadeOut = () => {
            element.style.opacity = '1';

            // Delay para reiniciar
            setTimeout( () => {
                return play(element, data);
            }, milliseconds);
        }
    }

    // Mostrar Elemento
    function showLightbox(element, data) {
        if(!clicked) {
            // Add elementos container, shadowbox e botão de fechar no body
            lb = document.createElement('div');
            lb.innerHTML = `<div class="close-lb" id="lb-shadowbox"></div><div class="close-lb" id="lb-close">×</div>`;
            lb.setAttribute('id', 'lb-window');
            document.body.appendChild(lb);
            
            width = lb.scrollWidth;
            height = lb.scrollHeight;

            // Apos o clique busca elementos que podem fechar a Lightbox
            document.querySelectorAll('.close-lb').forEach(element => {
                element.addEventListener('click', () => {
                    closeLb(lb);
                });
            });

            // Criar container para imagem
            imgContainer = document.createElement('div');
            imgContainer.setAttribute('id', 'lb-img');
            lb.appendChild(imgContainer);

            // Coloca thumbnails na tela
            if(isGallery) showGallery(data);

            // Prevenir seleção, para não ocorrer erros de slide
            document.body.addEventListener('selectstart', preventEvent);

            document.body.style.overflowY = 'hidden';

        } else {
            if(element.getAttribute('href') == img.getAttribute('src')) return;
            imgContainer.removeChild(img);
            imgContainer.style.height = ''; 
        }  

        clicked = true;
        
        img = document.createElement('img');

        img.setAttribute('src', element.getAttribute('href'));
        img.setAttribute('class', 'fade');
        img.onload = removeLoader();
        imgContainer.appendChild(img);

        setTimeout(() => {
            verifySize(imgContainer, width, height);
            if(!isMobile  && Left != null) {
                Left.style.marginLeft = `-${(imgContainer.scrollWidth / 2) + 70}px`;
                right.style.marginRight = `-${(imgContainer.scrollWidth / 2) + 70}px`;
            } 
            
        }, 200);

        preLoader();
        
        if(isGallery) setTimeout( () => { getIndex(img), 10 });         
    }

    //Mostra grupo de imagens
    function setGallery(element, data){

        if(!isMobile ) showControllers(true);
        isGallery = true;
        thumbs = [];

        // Verifica se é uma galeria oculta ou não
        if(data.galleryName != 'mylightbox[folder]') {
            const thumbsClone = [].slice.call(document.querySelectorAll(`[rel="${data.galleryName}"]`));
            
            // Add clones do thumClone no thumbs
            for(let i = 0; i < thumbsClone.length; i++) {
                thumbs[i] = thumbsClone[i].cloneNode(true);
                const img = thumbs[i].querySelector('img');
                thumbs[i].innerHTML = '';
                thumbs[i].appendChild(img);
            }
        }
        else {
            for(let i = 0; i < data.length; i++) {
                thumbs[i] = document.createElement('a');
                thumbs[i].setAttribute('href', `${data.directory}/${i+1}.${data.type}`);
            }
        }
        showLightbox(element, data);
    }

    function showGallery(data) {
        const gallery = document.createElement('div');
        gallery.setAttribute('id', 'lb-gallery');
        gallery.setAttribute('class', 'fade');
        lb.appendChild(gallery);

        const height = gallery.scrollHeight;

        // Ajusta thumbnails
        let i = 1
        thumbs.forEach(e => {
            if(data.galleryName != 'mylightbox[folder]') {
                let img = e.querySelector('img');
                img.setAttribute('style', `width: ${height-10}px; height: ${height-10}px;`);
                img.onload = removeLoader();
            } else {
                let img = document.createElement('img');
                img.setAttribute('src', `${data.directory}/${i}.${data.type}`);
                img.setAttribute('style', `width: ${height-10}px; height: ${height-10}px;`);
                img.onload = removeLoader();
                e.appendChild(img);
                i++;
            }  
            e.setAttribute('class', 'lb-thumbnails');
            gallery.appendChild(e); 
            listener(e, 'thumbnails');
        });

        mouseSlider(gallery);
        preventDrag(thumbs);  
    }

    // Mostra controladores
    function showControllers(open) {
        if(open){
            Left = document.createElement('div');
            right = document.createElement('div');
            
            Left.setAttribute('id', 'lb-left-arrow');
            right.setAttribute('id', 'lb-right-arrow');

            Left.innerHTML = '‹';
            right.innerHTML = '›';

            document.body.appendChild(Left);
            document.body.appendChild(right);

            Left.style.marginTop = `-${Left.scrollHeight / 2}px`;
            right.style.marginTop = `-${right.scrollHeight / 2}px`;

            controlListener(Left, right);
        }
        else {
            document.body.removeChild(Left);
            document.body.removeChild(right); 
        }
    }

    // Mouse slider
    function mouseSlider(element) {
        let isDown = false;
        let startX; 
        let scrollLeft;

        if(!isMobile ){
            element.addEventListener('mousedown', e => {
                isDown = true;
                element.classList.add('lb-slider');
                startX = e.pageX - element.offsetLeft; // Define local do click no eixo X
                scrollLeft = element.scrollLeft;       // Define a local do scroll
            });
            element.addEventListener('mouseup',  () => {
                isDown = false;
                element.classList.remove('lb-slider');
            });
            element.addEventListener('mousemove', e => {
                if(!isDown) return // Parar de executar se for false
                e.preventDefault();
                const x = e.pageX - element.offsetLeft; // Define local onde click foi solto
                const walk = (x - startX);              // Distancia a percorer, aumentar a velocida com * N
                element.scrollLeft = scrollLeft - walk; // Movimenta scroll do elemento
            });
        }
        else {
            element.addEventListener('touchstart', e => {
                isDown = true;
                startX = e.changedTouches[0].pageX - element.offsetLeft; // Define local do click no eixo X
                scrollLeft = element.scrollLeft;                        // Define a local do scroll
            });
            element.addEventListener('touchend',  () => {
                isDown = false;
            });
            element.addEventListener('touchmove', e => {
                if(!isDown) return // Parar de executar se for false
                const x = e.changedTouches[0].pageX - element.offsetLeft; // Local onde click foi solto
                element.scrollLeft = scrollLeft - (x - startX);         // Movimenta scroll do elemento
            })
        }
    }

    // Previne que thumbnails sejam arrastadas, melhoramento no slide
    function preventDrag(element){
        element.forEach(e => {
            e.addEventListener('dragstart', preventEvent);  
        });
    }

    // Captura index e dá foco no elemento
    function getIndex(element) { 
        // Encontra children correta
        galleryIndex = thumbs.find(e => {
            if(element.getAttribute('src') == e.getAttribute('href')) return e
        });

        galleryIndex = thumbs.indexOf(galleryIndex);
        thumbs[galleryIndex].focus();
    }

    // Add listeners as setas laterais
    function controlListener(lArrow, rArrow) { 
        lArrow.addEventListener('click', arrowLeft);
        rArrow.addEventListener('click', arrowRight);
    }

    function arrowLeft() {
        if(galleryIndex > 0) showLightbox(thumbs[--galleryIndex]);
    }

    function arrowRight() {
        if(galleryIndex < thumbs.length - 1) showLightbox(thumbs[++galleryIndex]);
    }

    // Verificar tamanho e alinha no centro da janela
    function verifySize(element, width, height) {
        if(height < element.scrollHeight) element.style.height = '98%';
        if(width < element.scrollWidth) element.style.width = '97%';

        element.style.marginTop = `-${element.scrollHeight / 2}px`;    
        element.style.marginLeft = `-${element.scrollWidth / 2}px`;
    }

    // Loader 
    function preLoader() {
        loader = document.createElement('div');   
        loader.setAttribute('class', 'loader');
        loader.innerHTML = `<div></div>`;
        lb.appendChild(loader);
        verifySize(loader, width, height);
        loading = true;
    }

    // Remove loader apenas depois de carregar ultima imagem
    function removeLoader() {
        if(loaded >= thumbs.length) {
            setTimeout(() => {
                let fade = document.querySelectorAll('.fade'); 
                let getLoader = document.querySelectorAll('.loader');    
                fade.forEach(e => {
                    e.removeAttribute('class');
                }); 
                getLoader.forEach( e => {
                    lb.removeChild(e);  
                });
                loading = false;
            }, 200);
        }
        else {
            loaded++;
        }    
    }

    // Fecha Light Box
    function closeLb(element) {
        if(clicked) {
            document.body.style.overflowY = 'auto';                
            document.body.removeChild(element);
            clicked = false;
            loaded = 0;
            thumbs = [];
            document.body.removeEventListener('selectstart', preventEvent);
        }
        if(isGallery) {
            if(!isMobile ) showControllers(false);
            isGallery = false;
        }
    }

    // Detecta se tecla ESC for pressionada e fecha janela 
    // E também as Arrow keys Left e right
    document.onkeydown = function(evt) {
        evt = evt || window.event;;
        if (evt.code == 'Escape' && clicked) closeLb(lb);

        if (evt.code == 'ArrowLeft' && isGallery) arrowLeft();

        if (evt.code == 'ArrowRight' && isGallery) arrowRight();
    }

    // O método preventDefault foi colocado em um função para ser removido facilmente
    function preventEvent(element){    
        element.preventDefault();
    }
};