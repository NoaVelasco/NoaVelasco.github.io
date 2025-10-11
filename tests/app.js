// Carga las preguntas desde preguntas.json y muestra una UI básica de examen
(function(){
  const dataPath = 'preguntas.json';

  const el = {
    progreso: document.getElementById('progreso'),
    preguntaCard: document.getElementById('pregunta-card'),
    enunciado: document.getElementById('enunciado'),
    opciones: document.getElementById('opciones'),
    siguiente: document.getElementById('siguiente'),
    finalizar: document.getElementById('finalizar'),
    resultado: document.getElementById('resultado')
  };

  let preguntas = [];
  let indices = [];
  let indexActual = 0;
  // respuestas almacenadas: {numeroPregunta: letraSeleccionada}
  let respuestas = {};

  function shuffle(array){
    for(let i=array.length-1;i>0;i--){
      const j=Math.floor(Math.random()*(i+1));
      [array[i],array[j]]=[array[j],array[i]];
    }
  }

  function load(){
    fetch(dataPath).then(r=>{
      if(!r.ok) throw new Error('No se pudo cargar preguntas');
      return r.json();
    }).then(json=>{
      preguntas = json.preguntas || [];
      if(!Array.isArray(preguntas) || preguntas.length===0) throw new Error('No hay preguntas');

      // crear indices y barajear
      indices = preguntas.map((_,i)=>i);
      shuffle(indices);
      indexActual = 0;
      el.progreso.textContent = `Pregunta ${indexActual+1} de ${indices.length}`;
      showPregunta();
    }).catch(err=>{
      el.progreso.textContent = 'Error cargando preguntas.';
      console.error(err);
    });
  }

  function showPregunta(){
    const idx = indices[indexActual];
    const p = preguntas[idx];
    el.enunciado.textContent = p.enunciado;
    el.opciones.innerHTML = '';

    const opcionesOrden = ['a','b','c','d'].filter(k=>p[k]).map(k=>({k,text:p[k]}));
    shuffle(opcionesOrden);

    opcionesOrden.forEach(opt=>{
      const li = document.createElement('li');
      li.tabIndex = 0;
      li.dataset.key = opt.k;
      li.textContent = opt.text;
      li.addEventListener('click', ()=> seleccionar(li));
      li.addEventListener('keydown', (e)=>{ if(e.key==='Enter') seleccionar(li); });
      el.opciones.appendChild(li);
    });

    // resaltar si ya respondida
    const preguntaNumero = p.numero;
    const resp = respuestas[preguntaNumero];
    if(resp){
      // marcar la opcion correspondiente
      Array.from(el.opciones.children).forEach(li=>{
        li.classList.toggle('selected', li.dataset.key === resp);
      });
      el.siguiente.disabled = false;
    } else {
      Array.from(el.opciones.children).forEach(li=>li.classList.remove('selected'));
      el.siguiente.disabled = true;
    }

    el.preguntaCard.classList.remove('hidden');
    el.resultado.classList.add('hidden');
    el.progreso.textContent = `Pregunta ${indexActual+1} de ${indices.length}`;
  }

  function seleccionar(li){
    // marcar visualmente
    Array.from(el.opciones.children).forEach(x=>x.classList.remove('selected'));
    li.classList.add('selected');

    // almacenar la respuesta
    const idx = indices[indexActual];
    const p = preguntas[idx];
    respuestas[p.numero] = li.dataset.key;
    el.siguiente.disabled = false;
  }

  el.siguiente.addEventListener('click', ()=>{
    if(indexActual < indices.length - 1){
      indexActual++;
      showPregunta();
    } else {
      // fin del recorrido
      calcularResultado();
    }
  });

  el.finalizar.addEventListener('click', ()=>{
    calcularResultado();
  });

  function calcularResultado(){
    // calcular sobre las respondidas
    const respondidas = Object.keys(respuestas).length;
    let correctas = 0;
    for(const [numStr, sel] of Object.entries(respuestas)){
      const num = Number(numStr);
      const p = preguntas.find(x=>x.numero === num);
      if(p && p.respuesta === sel) correctas++;
    }

    const porcentaje = respondidas === 0 ? 0 : Math.round((correctas/respondidas)*100);

    el.resultado.innerHTML = `<div class=card><h3>Resultado</h3><p>Contestadas: ${respondidas} &nbsp;|&nbsp; Correctas: ${correctas}</p><p class="score">Puntuación: <strong>${porcentaje}%</strong></p></div>`;
    // mostrar en la UI las respuestas en la pregunta actual (si quieres revisar)
    highlightAnswers();
    el.resultado.classList.remove('hidden');
    el.preguntaCard.classList.add('hidden');
  }

  function highlightAnswers(){
    // Si estamos mostrando una pregunta concreta, colorea opciones según correcta/incorrecta
    const idx = indices[indexActual];
    const p = preguntas[idx];
    Array.from(el.opciones.children).forEach(li=>{
      li.classList.remove('correct','wrong');
      const key = li.dataset.key;
      if(p.respuesta === key) li.classList.add('correct');
      const user = respuestas[p.numero];
      if(user && user !== p.respuesta && key === user) li.classList.add('wrong');
    });
  }

  // iniciar carga
  load();
})();
