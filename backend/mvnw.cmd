@IF "%DEBUG%" == "" @ECHO OFF
@SETLOCAL

set "APP_BASE_DIR=%~dp0"
set "APP_DIR=%APP_BASE_DIR:~0,-1%"
set "WRAPPER_JAR=%APP_BASE_DIR%.mvn\wrapper\maven-wrapper.jar"
set "WRAPPER_LAUNCHER=org.apache.maven.wrapper.MavenWrapperMain"

if not exist "%WRAPPER_JAR%" (
    powershell -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; (New-Object Net.WebClient).DownloadFile('https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.3.2/maven-wrapper-3.3.2.jar', '%WRAPPER_JAR%')"
)

java -Dmaven.multiModuleProjectDirectory="%APP_DIR%" -cp "%WRAPPER_JAR%" %WRAPPER_LAUNCHER% %*
exit /B %ERRORLEVEL%
