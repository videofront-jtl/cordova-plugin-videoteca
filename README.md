# Cordova Videoteca Plugin

## Instalação

Lembre-se de alterar ``https://SUAVIDEOTECA.videofront.com.br/`` pela URL da sua Videoteca

### Linha de comando

```
cordova plugin add https://github.com/videofront/cordova-plugin-videoteca/ --variable URL_VIDEOTECA="https://SUAVIDEOTECA.videofront.com.br/"
```

### Adicionando no config.xml

```xml
<plugin name="cordova-plugin-videoteca"
        spec="https://github.com/videofront/cordova-plugin-videoteca">
    <param name="URL_VIDEOTECA" value="https://SUAVIDEOTECA.videofront.com.br/" />
</plugin>
```

## Uso Simples

```javascript
var aluno_id = 123456;
CordovaVideoteca.playVideo ( 'VIDEO_IDENTIFIER_DA_VIDEOTECA', aluno_id );
```

## Opções avaçadas

```javascript
var options = {
    aluno           : {
        matricula : 123456,
        nome      : "Eduardo Kraus",
        email     : "kraus(A)eduardokraus.com",
        outro     : 'dado'
    },
    autoplay        : true,
    speeds          : [ 0.75, 1, 1.5, 2 ],
    successCallback : function () {
    },
    errorCallback   : function ( errMsg ) {
        console.log( errMsg );
    },
    orientation     : 'landscape' // usado apenas no IOS
};
var aluno_id = 123456;
CordovaVideoteca.playVideo ( 'VIDEO_IDENTIFIER_DA_VIDEOTECA', aluno_id, options );
```
