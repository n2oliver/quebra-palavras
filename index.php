<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Caixa de Letras | n2oliver</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" rel="stylesheet"/>
    <link rel="stylesheet" href="style.css" />
    <link rel="stylesheet" href="/styles-index.css" />
    <link rel="stylesheet" href="/sobre-mim.css" />
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" />
    <link href="https://fonts.googleapis.com/css2?family=Ubuntu:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400;1,500;1,700&amp;display=swap" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.min.js" integrity="sha384-0pUGZvbkm6XF6gxjEnlmuGrJXVbNuzT9qBBavbLwCsOGabYfZo0T0to5eqruptLy" crossorigin="anonymous"></script>
    <script type="text/javascript" data-cfasync="false" src="script.js"></script>
    <!--<script data-cfasync="false" src="/popads-monetization.js"></script>-->
    <!-- Hotjar Tracking Code for n2oliver.com -->
    <script>
        (function(h,o,t,j,a,r){
            h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
            h._hjSettings={hjid:6543030,hjsv:6};
            a=o.getElementsByTagName('head')[0];
            r=o.createElement('script');r.async=1;
            r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
            a.appendChild(r);
        })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
    </script>
</head>
<body>
    <script async src="https://appsha-pnd.ctengine.io/js/script.js?wkey=97NjKiTr7b"></script>

    <div id="frame" style="width: 100%;margin: auto;position: relative; z-index: 99998;">
        <iframe data-aa='2412101' src='//acceptable.a-ads.com/2412101/?size=Adaptive'
                        style='border:0; padding:0; width:70%; height:auto; overflow:hidden;display: block;margin: auto'></iframe>
        <div style="width: 70%;margin:auto;position: absolute;left: 0;right: 0">
        <a target="_blank" style="display:inline-block;font-size: 13px;color: #263238;padding: 4px 10px;background: #F8F8F9;text-decoration: none; border-radius: 0 0 4px 4px;" id="frame-link" href="https://aads.com/campaigns/new/?source_id=2412101&source_type=ad_unit&partner=2412101">Advertise here</a>
        </div>
    </div>
    
    <header>
        <?php include("../../navbar.php"); ?>
    </header>
    <div class="game-container">
        <script>
        // Ajusta o grid para 5x5 via JS
        document.addEventListener('DOMContentLoaded', function() {
            const gridEl = document.getElementById('grid');
            gridEl.style.gridTemplateColumns = 'repeat(5, 1fr)';
            gridEl.style.gridTemplateRows = 'repeat(5, 1fr)';
        });
        </script>
        <div class="game-title text-dark bg-warning m-auto"><strong>Caixa de Letras</strong></div>
        <div class="instructions"><strong>Arraste ou clique para mover as letras. Encontre palavras comuns do português brasileiro!</strong>
            <div class="botoes text-center">
                <button id="btnRestart" class="btn btn-warning" onclick="restart()"><strong id="reiniciar">Carregando...</strong><i class="fas fa-spinner fa-spin"></i></button>
            </div>
        </div>
        
        <div id="word" class="word notranslate" translate="no"></div>
        <div id="grid" class="grid notranslate" translate="no" style="grid-template-columns: repeat(8, 1fr); grid-template-rows: repeat(3, 1fr);"></div>
    </div>
    <?php include("../../footer.php"); ?>
    <script>
        function restart() {
            window.open('https://laxativethem.com/vs23jmys5q?key=7c2ccbc5de27850e97ac9aae68ac23a4', '_blank');
            setTimeout(()=>{
                window.location.reload();
            }, 500);
        }
    </script>
</body>
</html>