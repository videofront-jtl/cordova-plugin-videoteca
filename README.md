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
CordovaVideoteca.playVideo ( 'ID_VIDEO_NA_VIDEOTECA' );
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
    },
    orientation     : 'landscape' // apenas IOS
};
CordovaVideoteca.playVideo ( 'ID_VIDEO_NA_VIDEOTECA', options );
```
