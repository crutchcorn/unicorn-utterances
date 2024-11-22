---
{
  title: "Preface",
  description: "Learning web development is a vital skill in a software engineer's toolbox. Let's talk about why you should learn it and what this book will cover.",
  published: "2024-03-11T12:01:00.000Z",
  authors: ["crutchcorn"],
  translators: ['glabory'],
  tags: ["react", "angular", "vue", "webdev"],
  attached: [],
  order: 1,
  collection: "framework-field-guide-fundamentals",
}
---

Bienvenido al primer libro de la serie "Guía de Campo de Frameworks" titulado "Fundamentos". Este libro es el resultado de una carrera profesional de desarrollo de software de casi 10 años. También han pasado más de dos años de escritura, edición y pulido, y es el primero de lo que será una trilogía de libros que enseñan desarrollo web frontend.

Esta serie te enseñará cómo construir aplicaciones, los conceptos detrás de los modernos frameworks web y los patrones de codificación avanzados para ayudarte a mejorar tu ingeniería.

Mientras que otros recursos pueden ayudarte a aprender estos conceptos para un solo framework, **esta serie te ayudará a aprender tres frameworks diferentes a la vez: React, Angular y Vue.**

Específicamente, estaremos viendo las iteraciones más modernas de estos frameworks: React 18, Angular 17 y Vue 3.

> Vale la pena mencionar que React y Angular iteran sus versiones principales con mucha más frecuencia que Vue. Así que si estás leyendo esto en el futuro y ves "Angular 24" o "React 22", es probable que estén utilizando conceptos similares bajo el capó.

Podemos hacer esto porque, a pesar de ser diferentes en muchos aspectos, estos frameworks comparten las mismas ideas fundamentales que manejan cualquier aplicación moderna. Sin embargo, esto no quiere decir que sean iguales, y debido a esto, me pararé en cada framework para explicar dónde difieren y cómo funcionan bajo el capó individualmente.

Al final de esta serie, deberías ser capaz de navegar con confianza cualquier código utilizando estos frameworks.

Pero me estoy adelantando; primero, respondamos algunas preguntas fundamentales.

# ¿Por qué Debería Aprender Desarrollo Web Hoy? {#why-learn-webdev}

Aprender desarrollo web es una habilidad vital en la ingeniería de software. Incluso si no terminas trabajando en tecnología web, la probabilidad de que un proyecto eventualmente utilice tecnología web es excepcionalmente alta. Conocer y entender las limitaciones del frontend web puede:

- Facilitar la comunicación con esos equipos.
- Facilitar la estructuración de APIs backend efectivas.
- Permitirte transferir ese conocimiento a otros desarrollos de interfaz de usuario.

Además, existe un mercado laboral absolutamente gigantesco. Citando [a la Oficina de Estadísticas Laborales de EE.UU.](https://web.archive.org/web/20211231182416/https://www.bls.gov/ooh/computer-and-information-technology/home.htm):

> El empleo en ocupaciones de tecnología de la información y la informática se proyecta que crecerá un 13% desde 2020 hasta 2030, más rápido que el promedio para todas las ocupaciones. Se proyecta que estas ocupaciones agregarán alrededor de 667.600 nuevos empleos.
>
> \[...]
>
> **La media del salario anual para ocupaciones de tecnología de la información y la informática fue de 91.250$ en mayo de 2020**.

Si bien este número puede ser específico para los Estados Unidos, y otros países y mercados pueden tener tasas diferentes, la programación tiende a ser una apuesta segura para una carrera sostenible a largo plazo.

## ¿Por qué debería aprender estas herramientas? {#why-learn-these-tools}

Si bien el desarrollo web es ampliamente útil de aprender como habilidad para trabajar en ingeniería, estos frameworks, en particular, son una gran ventaja para aprender.

### Tamaño del Ecosistema {#ecosystem-size}

Para empezar, estas herramientas son ampliamente adoptadas. [React, Angular y Vue representan el 9% de la web en 2021](https://almanac.httparchive.org/en/2021/javascript#libraries-usage) y están creciendo constantemente. Aunque eso pueda sonar como poco, recuerda que [hay más de 1,9 mil millones de sitios web hasta 2022](https://web.archive.org/web/20240210190759/https://www.internetlivestats.com/total-number-of-websites/); Incluso el 1% representa casi 10 millones de sitios.

Por ejemplo, React tiene 17 millones de descargas semanales solo en NPM y alimenta los productos de Meta (incluidos Facebook, Instagram y Messenger). Además, React es utilizado por una gran cantidad de empresas; desde Fortune 500 hasta startups emergentes están utilizando React en algún nivel.

Del mismo modo, aunque más pequeño, Angular está vivo hoy en día (a diferencia de su predecesor con un nombre extrañamente similar pero distintivo, "AngularJS"). Angular obtiene más de dos millones de descargas semanales de NPM y alimenta sitios como el sitio web de Xbox de Microsoft, el sitio web de Office Web Home, el sitio web de Google Voice, el sitio web de Messages, el panel de Firebase y muchos, muchos más.

Finalmente, Vue ha experimentado un rápido crecimiento en los últimos años. Desde [obtener 50 millones de descargas en 2019 hasta más de 125 millones en 2022 en NPM](https://npm-stat.com/charts.html?package=vue&from=2019-01-01&to=2021-12-31), ha visto un éxito impresionante en el ecosistema. Además, Vue ve niveles de adopción altos en China. Entre los adoptantes de Vue en China se encuentran [Alibaba, un importante sitio de compras](https://madewithvuejs.com/alibaba), y [Bilibili, una plataforma de intercambio de videos](https://madewithvuejs.com/bilibili).

### Herramientas del Ecosistema {#ecosystem-tools}

Si bien el tamaño del ecosistema es excelente, no significa nada sin una variedad de herramientas a tu disposición para mejorar la experiencia del desarrollador y las capacidades de dichos frameworks.

Afortunadamente, para los tres frameworks por igual, hay una gran cantidad de herramientas que se construyen sobre su base.

Por ejemplo, ¿[quieres agregar Generación de Sitios Estáticos o Renderizado del Lado del Servidor](https://unicorn-utterances.com/posts/what-is-ssr-and-ssg) a tus proyectos para mejorar el SEO? No hay problema: React tiene [Next.js](https://nextjs.org/) y [Gatsby](https://gatsbyjs.com/), Angular tiene [Angular Universal](https://angular.io/guide/universal) y [Analog](https://analogjs.org/), y Vue tiene [NuxtJS](https://nuxtjs.org/) y [VuePress](https://vuepress.vuejs.org/).

¿Quieres agregar un enrutador para añadir múltiples páginas a tus aplicaciones? React tiene ["React Router"](https://reactrouter.com/), [Angular tiene su enrutador integrado](https://angular.io/guide/router), y Vue tiene ["Vue Router"](https://router.vuejs.org/).

¿Quieres agregar gestión de estado global, facilitando el compartir datos en toda la aplicación? React tiene [Redux](https://redux.js.org/), Angular tiene [NgRx](https://ngrx.io/), y Vue tiene [Vuex](https://vuex.vuejs.org/).

¡La lista sigue y sigue! ¡Lo mejor es que la lista que di para cada uno no es exhaustiva!

De hecho, aunque estos frameworks tradicionalmente se asocian con la web y el navegador, incluso hay herramientas del ecosistema que te permiten incrustar Angular, React o Vue en aplicaciones móviles y nativas.

Estas herramientas incluyen [ElectronJS](https://www.electronjs.org/) y [Tauri](https://github.com/tauri-apps/tauri) para aplicaciones de escritorio, junto con [React Native](https://reactnative.dev/) y [NativeScript](https://nativescript.org/) para móviles. Si bien React Native solo admite React, las otras opciones que mencioné admiten los tres frameworks que abordaremos.

Si bien este libro, en particular, no abordará la mayor parte del ecosistema, el segundo libro de nuestra trilogía se titulará "Ecosistema". "Ecosistema" te enseñará cómo integrar los conocimientos fundamentales que este libro presenta para construir aplicaciones más complejas con estas herramientas de la comunidad.

## ¿Quién construye qué? {#framework-owners}

Esto no significa que la única razón por la que estas herramientas perdurarán sea porque son populares; cada uno de estos frameworks tiene al menos un respaldo prominente detrás de ellos.

React es desarrollado por Meta y alimenta todas sus principales aplicaciones. Además, el equipo central ha comenzado a aceptar contribuciones externas a través de retroalimentación sobre el desarrollo del framework mediante ["grupos de trabajo", que consisten en expertos en el tema](https://github.com/reactwg). En los últimos años, incluso [grupos como Vercel han contratado miembros centrales de React para trabajar en el proyecto desde fuera de Meta](https://twitter.com/sebmarkbage/status/1470761453091237892).

Sin embargo, cuando la mayoría menciona "React", tienden a hablar sobre el ecosistema de React en general. Verás, los mantenedores principales de React en sí tienden a permanecer enfocados en una pequeña subsección de herramientas. En cambio, confían en grupos externos, como [Remix](https://remix.run/) y [Vercel](https://vercel.com/), para proporcionar bibliotecas que a menudo son integrales para el desarrollo de aplicaciones.

Por otro lado, Angular está completamente financiado y respaldado por Google. Construyen una parte sustancial de sus principales sitios web sobre el framework y, como resultado, tienen un interés en continuar y mantener el desarrollo. Continuando con las diferencias con React, el equipo central de Angular mantiene un conjunto de bibliotecas auxiliares que proporcionan todo, desde una [capa de llamadas HTTP](https://angular.io/guide/http) hasta [validación de formularios](https://angular.io/guide/forms-overview).

Vue es a menudo visto como el extraño cuando se habla de financiamiento. El desarrollo de Vue es impulsado por un equipo independiente financiado por una diversa variedad de grupos e individuos. Sin embargo, aunque no está claro cuánto dinero recaudan, está claro que hay contribuyentes financieros de gran tamaño involucrados, [como Alibaba, Baidu, Xiaomi y más](https://medium.com/the-vue-point/the-state-of-vue-1655e10a340a).

Al igual que Angular, el equipo central de Vue está formado por grupos que trabajan en un amplio conjunto de herramientas. Todo, desde [la biblioteca de enrutamiento oficial](https://router.vuejs.org/) hasta sus dos bibliotecas de almacenamiento global ([Vuex](https://vuex.vuejs.org/) y [Pinia](https://pinia.vuejs.org/)), se consideran parte del núcleo de Vue.

### ¿Por qué aprender los tres frameworks? {#why-learn-all-three}

Si bien la respuesta obvia es que "amplía los tipos de trabajo que puedes conseguir", hay muchas razones para aprender más de un framework al mismo tiempo.

En particular, cada framework tiene sus propias restricciones, reglas y mejores prácticas. Estas reglas y restricciones pueden ayudarte a comprender una forma diferente de codificación que a menudo se transfiere a otros frameworks.

Por ejemplo, Angular se centra en la programación orientada a objetos, mientras que el ecosistema de React favorece la programación funcional. Si bien lo que significa cada una de estas cosas no es inmediatamente importante, te permiten hacer muchas de las mismas cosas de diferentes maneras y tienen sus pros y contras.

Debido a esto, una vez que hayas dominado cada uno, puedes elegir qué metodología de programación deseas aplicar en partes de tus aplicaciones.

<!-- ::in-content-ad title="Considere la posibilidad de apoyar" body="Donar cualquier cantidad ayudará al desarrollo continuo de la Guía de Campo de Frameworks." button-text="Patrocine mi trabajo" button-href="https://github.com/sponsors/crutchcorn/" -->

Más allá de esto, es importante recordar que estos tres frameworks no son las únicas opciones disponibles en el desarrollo web. Svelte es una alternativa que ha estado ganando un tremendo impulso, por ejemplo. Aunque difiere aún más de las tres opciones que estamos aprendiendo, Svelte comparte muchas de las bases de React, Angular y Vue.

Este traslado de conocimientos no se detiene en JavaScript o en el desarrollo web, tampoco. Cuanto más aprendas sobre cualquier aspecto de la programación, más se puede utilizar en otros lenguajes o tipos de programación. Muchas de las API que he utilizado en el desarrollo web también fueron valiosas al realizar trabajo de ingeniería con lenguajes nativos.

### ¿Estas herramientas perdurarán? {#tool-longevity}

¿Honestamente? ¿Quién puede decirlo? El ecosistema tiene sus fluctuaciones; muchos desarrolladores parecen sentir algún nivel de agotamiento del ecosistema de React después de tanto tiempo dentro de él.

Pero aquí está la cosa: estas herramientas cuentan con un amplio respaldo y son utilizadas por algunas de las empresas más grandes.

Estos tipos de herramientas no desaparecen de la noche a la mañana, ni tampoco los trabajos asociados con estas herramientas.

Mira ColdFusion, por ejemplo. Si le preguntas a la mayoría de los desarrolladores frontend, es probable que o bien no conozcan ColdFusion o asuman que está muerto. Después de todo, ColdFusion se remonta a 1995 y sigue siendo un lenguaje de programación propietario de pago, ¡sí, esos existen!, hasta el día de hoy.

¡Pero ColdFusion no está muerto! (Puedo escuchar a mi amigo Mark gritar de emoción y acuerdo desde millas de distancia.) [Todavía se usa en tantos sitios web](https://w3techs.com/technologies/details/pl-coldfusion) [como Angular lo está](https://w3techs.com/technologies/details/js-angularjs) en 2024, y mantiene un ecosistema de un tamaño respetable que es lo suficientemente grande como para permitir que Adobe sostenga el desarrollo del lenguaje 27 años después.

Además, desde un punto de vista cultural, muchos desarrolladores también están cansados de cambiar constantemente entre nuevos frameworks a velocidades aparentemente vertiginosas. Muchas empresas pueden optar por quedarse con estas herramientas durante más tiempo de lo previsto simplemente porque han adquirido experiencia con ellas.

Solo porque una herramienta sea nueva no significa que sea inherentemente mejor; incluso las herramientas mejor percibidas pueden no ser seleccionadas por varias razones.

# ¿Cuáles son los requisitos previos? {#what-are-the-prerequisites}

Aprenderemos React, Angular y Vue desde cero hasta comprender el funcionamiento interno de estos frameworks.

**No necesitas ningún conocimiento previo de estos frameworks y muy poco conocimiento previo de JavaScript, HTML o CSS.**

De hecho, haré todo lo posible para enlazar con cualquier cosa que se espera que se conozca o sea valiosa en el proceso de aprendizaje continuo. Dicho esto, si eres nuevo en estos temas, algunas lecturas previas sugeridas podrían incluir:

- ["How Computers Speak" — An introduction to how your computer takes "source code" and converts it to machine code.](https://unicorn-utterances.com/posts/how-computers-speak)
- ["Introduction to HTML, CSS, and JavaScript" — An explanation of the three fundamentals of web development and how they're utilized to build websites.](https://unicorn-utterances.com/posts/intro-to-html-css-and-javascript)
- ["CSS Fundamentals" — An introduction to how CSS works and common rules you should know.](https://unicorn-utterances.com/posts/css-fundamentals)
- ["WebDev 101: How to use NPM and Yarn" — An explanation of what "Node" is, what "NPM" is, and how to use them.](https://unicorn-utterances.com/posts/how-to-use-npm)
- ["Understanding The DOM: How Browsers Show Content On-Screen" — An explanation of the "DOM" and how it pertains to HTML.](https://unicorn-utterances.com/posts/understanding-the-dom)

## ¿Qué no vamos a aprender? {#what-arent-we-learning}

Antes de echar un vistazo a algunos detalles de lo que vamos a aprender, **hablemos de lo que no dedicaremos tiempo a aprender en esta serie**:

- APIs de JavaScript independientes
- CSS
- Herramientas de linting, como ESLint o Prettier
- Funcionalidades de IDE, como VSCode, WebStorm o Sublime Text
- TypeScript — aunque los ejemplos de código de Angular incluirán un poco de él, no profundizaremos en los detalles

Todos estos son temas amplios por derecho propio y tienen una gran cantidad de contenido capaz de albergar sus propios libros. Después de todo, los recursos sin un alcance adecuadamente definido enfrentan desafíos de explicaciones superficiales, transiciones bruscas e incluso publicaciones retrasadas.

> Recuerda, el conocimiento es como una red —estos temas se entrelazan de manera desordenada y compleja. ¡Está bien tomarse el tiempo para aprender estos temas o incluso limitar tu alcance de aprendizaje para permanecer enfocado en un subconjunto específico de conocimientos! Nadie conoce todos y cada uno de estos temas a la perfección, ¡y eso está bien!

Una vez más, sin embargo, si alguno de estos temas se vuelve relevante en el libro, enlazaremos a recursos que te ayudarán a explorar más y ampliar tu base de conocimientos.

## Esquema de Contenido {#content-outline}

Con la comprensión de lo que no vamos a ver, **hablemos de lo que sí vamos a aprender**:

- [Qué son los "componentes"](/posts/ffg-fundamentals-intro-to-components)
  - Dividir tu aplicación en piezas más modulares
  - La relación entre componentes y elementos y otros componentes y elementos
  - Agregar lógica programática dentro de tus componentes
  - Qué es la "reactividad" y cómo React, Angular y Vue facilitan mostrar valores actualizados
  - Vincular atributos reactivos a tus elementos
  - Pasar valores a tus componentes
  - Vincular eventos de usuario a comportamientos definidos por el desarrollador
  - Pasar valores desde componentes hijos a sus padres
- [Cambiar la interfaz de usuario usando HTML dinámico](/posts/ffg-fundamentals-dynamic-html)
  - Renderizar condicionalmente partes de tu aplicación
  - Renderizar listas y bucles
  - Matices en "reconciliación" para frameworks como React y Vue
- [Manejar la entrada y salida del usuario a través de efectos secundarios](/posts/ffg-fundamentals-side-effects)
  - Explicar qué es un "efecto secundario" fuera del contexto de un framework de UI
  - Reintroducir el concepto en el ámbito de un framework
  - Desencadenar efectos secundarios durante una renderización de componente
  - Limpiar efectos secundarios
  - Por qué necesitamos limpiar efectos secundarios (incluyendo ejemplos del mundo real)
  - Cómo verificamos que limpiamos nuestros efectos secundarios
  - Manejo de re-renderizaciones
  - Seguimiento de actualizaciones de estado en el componente para desencadenar efectos secundarios
  - Ciclo de vida de un framework, incluyendo renderización, commit y pintura
  - Cambiar datos sin volver a renderizar
- [Basar el estado en otro valor usando valores derivados](/posts/ffg-fundamentals-derived-values)
  - Una implementación ingenua usando la escucha de props
  - Una implementación más pensada usando primitivas del framework
- [Resolver problemas de marcado utilizando elementos transparentes](/posts/ffg-fundamentals-transparent-elements)
- [Pasar hijos a un componente](/posts/ffg-fundamentals-passing-children)
  - Pasar un hijo
  - Pasar varios hijos
- [Mantener una referencia a un elemento HTML en tu código](/posts/ffg-fundamentals-element-reference)
  - Seguir múltiples elementos a la vez
  - Uso en el mundo real
- [Referenciar los internos de un componente desde un padre](/posts/ffg-fundamentals-component-reference)
  - Uso en el mundo real
- [Rastrear errores que ocurran en tu aplicación](/posts/ffg-fundamentals-error-handling)
  - Registrar errores
  - Ignorar errores para permitir que el usuario siga utilizando la aplicación
  - Mostrar una alternativa cuando tu aplicación no pueda recuperarse de un error
- [Pasar datos complejos a toda tu aplicación usando inyección de dependencias](/posts/ffg-fundamentals-dependency-injection)
  - Cambiar valores después de la inyección
  - Optar por no proporcionar valores opcionales
  - Pasar datos en toda tu aplicación
  - Sobrescribir datos específicos en función de la proximidad al origen de los datos
  - Encontrar los datos adecuados para satisfacer las necesidades de tus componentes
  - Aprender la importancia de tipos de datos consistentes
- [Cómo evitar dolores de cabeza con el z-index de CSS utilizando portales](/posts/ffg-fundamentals-portals)
  - Entender por qué z-index tiene problemas en primer lugar
  - Explicar qué es un portal
  - Uso de portales específicos de componentes
  - Uso de portales de aplicación
  - Uso de portales de HTML
- [Crear utilidades componibles a través de lógica compartida de componentes](/posts/ffg-fundamentals-shared-component-logic)
  - Compartir métodos de creación de datos
  - Compartir manejadores de efectos secundarios
  - Componer lógica personalizada
- [Agregar comportamiento a elementos HTML fácilmente usando directivas](/posts/ffg-fundamentals-directives)
  - Explicar qué es una directiva
  - Mostrar directivas básicas
  - Cómo agregar efectos secundarios a las directivas
  - Pasar datos a las directivas
- [Modificar y acceder a los hijos de un componente](/posts/ffg-fundamentals-accessing-children)
  - Contar los hijos de un componente
  - Modificar cada hijo en un bucle
  - Pasar valores a los hijos proyectados

> Esto puede parecer abrumador, pero recuerda que este libro está destinado a ser un recurso de "cero" a "experto". No necesitas abordar todo esto de una vez. Puedes detenerte en cualquier punto, ir a otro lugar y volver cuando quieras. Este libro no va a ninguna parte y **será gratuito online para siempre**; está [disponible como código abierto para garantizar que así sea](https://github.com/unicorn-utterances/unicorn-utterances/).

¡Pero espera, hay más! Aunque este es el esquema del primer libro de la serie, habrá otros dos libros más que enseñarán React, Angular y Vue. El segundo libro se centrará en el ecosistema que rodea a estas herramientas, y el tercero se centrará específicamente en los aspectos internos y el uso avanzado.

A lo largo de todo esto, intentaremos construir una aplicación única como se describe en [el capítulo "Introducción a los Componentes"](/posts/ffg-fundamentals-intro-to-components). Al final de este libro, tendrás una interfaz de usuario completamente funcional que has construido tú mismo a través de ejemplos de código y desafíos mostrados a lo largo del libro.

También tendremos recursos fáciles de consultar en caso de que ya seas un experto en un framework específico y estés buscando aprender rápidamente:

- Un glosario de varios términos relevantes para estos frameworks.
- Una tabla de búsqueda con APIs equivalentes entre estos frameworks.

## Una Nota sobre Aspectos Específicos del Framework {#framework-specifics}

Como nota final, antes de que te adentres en el resto del libro, quiero abordar algunos puntos sobre estos frameworks:

<!-- ::start:tabs -->

### React

Aquí hay algunos matices que debemos tener en cuenta sobre las enseñanzas de React en este libro:

#### Estamos utilizando React Hooks {#react-hooks}

React tiene dos formas diferentes de escribir código: usando clases y "Hooks".

Aunque las clases de React son más similares a Angular o al Options API de Vue, **he decidido escribir este libro utilizando el método de "Hooks" de React como referencia para nuestros componentes.**

Esto se debe a que, aunque las clases siguen siendo parte de las versiones más modernas de React, han caído drásticamente en desuso en comparación con los React Hooks. Quiero tratar de que este libro sea representativo de bases de código del mundo real con las que es probable que te encuentres en las versiones modernas de estos frameworks, así que pensé que tenía sentido usar Hooks.

Dicho esto, los conceptos básicos descritos en este libro se aplican a ambos métodos, por lo que si deseas aprender el API de clases de React más adelante, debería ser más fácil con esta base de aprendizaje.

### Angular

Aquí hay algunos matices que debemos tener en cuenta sobre las enseñanzas de Angular en este libro:

#### Angular no es AngularJS {#angular-not-angularjs}

A pesar de las similitudes en sus nombres, estos dos son entidades completamente distintas. Más específicamente, [AngularJS fue lanzado inicialmente en 2010](https://unicorn-utterances.com/posts/web-components-101-history#2010-The-Early-Days-of-MVC-in-JS) y fue seguido por el lanzamiento inicial de Angular en 2016. **A pesar de esta línea de descendencia compartida, los conceptos principales cambiaron drásticamente entre estos dos lanzamientos.** Para todos los efectos, al final de este libro no conocerás AngularJS, sino Angular.

#### Estamos utilizando componentes independientes {#standalone-components}

Angular tiene dos formas de definir la importación de componentes: módulos y componentes independientes. **Utilizaremos componentes independientes**.

Cuando Angular fue lanzado por primera vez, se lanzó con [el concepto de NgModules](https://angular.io/guide/ngmodules). De manera muy amplia, esta era una API que te permitía agrupar una colección de elementos de interfaz de usuario relacionados (llamados componentes, más sobre eso en el próximo capítulo) en los llamados "módulos".

Si bien estos módulos funcionan, son principalmente diferentes a las alternativas en otros frameworks relacionados como React y Vue. Además, una queja común contra ellos es que son excesivamente complicados con un rendimiento mínimo.

[Comenzando con una versión experimental en Angular 14](https://github.com/angular/angular/discussions/45554) (y [marcada como estable en Angular 15](https://blog.angular.io/angular-v15-is-now-available-df7be7f2f4c8)), Angular introdujo la API de "componentes independientes". Este era un método más similar de importar elementos de interfaz de usuario similares entre sí y es lo que nuestro libro utilizará.

> Ten en cuenta que si estás trabajando con un código base de Angular más antiguo, es probable que aún estes utilizando módulos.

#### Estamos utilizando etiquetas auto-cerradas {#self-closing-tags}

HTML admite etiquetas auto-cerradas en algunos elementos que no contienen hijos:

```html
<input />
```

De manera similar, Angular 15.1 introdujo un método para usar etiquetas auto-cerradas con selectores de componentes:

```html
<component />
<!-- vs. <component></component> -->
```

**Utilizaremos estas etiquetas auto-cerradas en todo el libro**, ya que son una práctica común en aplicaciones construidas con los otros dos frameworks.

> Esto no funcionará con versiones de Angular anteriores a la 15.1, así que tenlo en cuenta cuando trabajes en código más antiguo.

#### No aprenderemos "Signals" {#no-signals}

[A principios de 2023, el equipo de Angular anunció que introducirían un nuevo método de programación en Angular llamado "Signals"](https://angular.io/guide/signals). Este libro comenzó en enero de 2022, y para cuando el libro se lanzó, partes de la API de signals aún no se habían introducido como una API estable dentro del ecosistema de Angular.

Aunque creo que las signals son el camino a seguir para la comunidad de Angular, retrasar el libro aún más y esperar a que esta API se estabilice simplemente no era viable. Por lo tanto, **este libro no enseñará signals de Angular** en este momento.

Sin embargo, en el futuro revisaré este libro para que esté orientado hacia las signals de Angular en lugar del método actual de mutaciones de Zone.js. Esto vendrá como una segunda edición del libro en algún momento futuro.

### Vue

Aquí hay algunos matices que debemos tener en cuenta sobre las enseñanzas de este libro sobre Vue:

#### Estaremos utilizando Composition API {#composition-api}

Vue tiene dos formas diferentes de escribir código: la "Options" API y la "Composition" API.

Mientras que la "Options" API ha estado presente durante más tiempo y es más similar a las clases de Angular, **este libro utilizará la "Composition" API** de Vue. Esto se debe a varias razones:

1. La "Composition" API es más reciente y aparentemente preferida sobre la "Options" API para nuevas aplicaciones.
2. La "Composition" API comparte cierta similitud con los Hooks de React, lo que facilita la explicación de conceptos inter-framework.
3. La "Composition" API es relativamente fácil de aprender una vez que se comprende completamente la "Options" API.
4. Su documentación hace un buen trabajo al proporcionar ejemplos de código tanto en la "Options" API como en la "Composition" API, lo que te permite aprender ambas de manera más fácil.
5. [Evan You, el creador del proyecto y líder del equipo de mantenimiento, me lo pidió.](https://twitter.com/youyuxi/status/1545281276856262656?s=20&t=ZBooorTRi6dYR1h_VVbu1A) 😝

De manera similar, este libro no abordará [la opción de sintaxis basada en el compilador de Vue, el "azucar sintáctico" `$ref`](https://github.com/vuejs/rfcs/discussions/369). Sin embargo, el libro "Internos" en esta serie de libros te guiará a través de todas estas diferentes API, por qué existen y cómo se construyen unas sobre otras.

#### We're Using SFCs {#vue-sfcs}

Vue es un framework altamente flexible y, como resultado, te permite definir componentes con varios métodos, cada uno con sus propias ventajas y desventajas.

**Este libro se enfocará específicamente en el método de ["Componente de Archivo Único" (o SFC por sus siglas en inglés)](https://vuejs.org/guide/scaling-up/sfc.html) para crear componentes Vue utilizando archivos `.vue`.**

Si bien el libro "Internals" (el tercero de la serie) presentará los otros métodos y cómo funcionan bajo el capó, los SFC son comúnmente utilizados como el método por defecto para crear componentes Vue en la mayoría de las aplicaciones.

<!-- ::end:tabs -->

Sin más preámbulos, empecemos.
