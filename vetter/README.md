# Vetter
***

Vetter es una aplicación web para el seguimiento de tus mascotas. Crea una ficha de mascota y guarda su historial médico, datos de tratamientos, dietas, rutinas, etc. Puedes compartir la ficha con copropietarios y tener siempre a mano los datos de contacto, añadir su clínica veterinaria e incluso los mejores amigos de tu animal.

La aplicación favorita de Daennerys de la Colonia, Madre de Tragones y Rompedora de correas. 

## Tecnologías
- Django
- SQLite
- Javascript
- HTML5 + CSS3

## Funcionamiento
### Usuarios
La pantalla de usuario ofrece información básica como nombre, foto, id para compartir con otros usuarios (por ejemplo para añadir como copropietario) y las secciones con sus animales y sus contactos.

Entre los datos que puede registrar un usuario se encuentran una dirección de correo, un teléfono o una dirección física que puede facilitar como contacto a otros usuarios. 

En la sección de contactos se mostrarán otros usuarios y/o veterinarias que haya añadido.

### Animales
La ficha de un animal está dividida en tres pantallas principales: Perfil, Ficha salud y Relaciones. Es común a todas la foto, nombre, especie, raza, edad y sexo. Además de poder editar esta información, se puede exportar la ficha en formato PDF o compartir su enlace con el id de animal. 

#### Perfil
Aquí tenemos la posibilidad de añadir anotaciones con los rasgos característicos y la personalidad, su dieta habitual y sus rutinas (paseos, sueño, juego, etc.). Además cuenta con una galería de imágenes. 

#### Ficha salud
Aquí podemos encontrar su número de chip, si está esterilizado, posibles enfermedades, alergias o cuidados, tratamientos, notas y seguimiento de peso, vacunas y visitas al veterinario.

#### Relaciones
El usuario puede añadir clínicas veterinarias, animales con los que se relaciona (útil si puede haber peligro de contagio) y otros usuarios (copropietarios, cuidadores, contacto de emergencia, etc.) que tenga en su perfil o directamente en esta pantalla. 