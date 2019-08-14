# Cordova Videoteca Plugin

## Instalação

Lembre-se de alterar ``https://SUAVIDEOTECA.videotecaead.com.br/`` pela URL da sua Videoteca

### Linha de comando

```
cordova plugin add https://github.com/videofront/cordova-plugin-videoteca/ --variable URL_VIDEOTECA="https://SUAVIDEOTECA.videotecaead.com.br/"
```

### Adicionando no config.xml

```xml
<plugin name="cordova-plugin-videoteca"
        spec="https://github.com/videofront/cordova-plugin-videoteca">
    <param name="URL_VIDEOTECA" value="https://SUAVIDEOTECA.videotecaead.com.br/" />
</plugin>
```

## Opções

```javascript
var aluno_id = 123456;
var options = {
    matricula       : aluno_id,
    aluno_nome      : "Eduardo Kraus",
    aluno_email     : "kraus(A)eduardokraus.com",
    safety          : "123.123.123-11", // CPF do aluno para sobrepor o player
    successCallback : function () {
        console.log( "OK" );
    },
    errorCallback   : function ( errMsg ) {
        console.error( errMsg );
    }
};
CordovaVideoteca.playVideo ( 'VIDEO_IDENTIFIER_DA_VIDEOTECA', aluno_id, options );
```
