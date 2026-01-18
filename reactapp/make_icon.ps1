Add-Type -AssemblyName System.Drawing
$bmp = New-Object System.Drawing.Bitmap 512, 512
$g = [System.Drawing.Graphics]::FromImage($bmp)
$brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 2, 6, 23)) # Dark Slate
$g.FillRectangle($brush, 0, 0, 512, 512)

# Add a simple text "I" for Instinct
$font = New-Object System.Drawing.Font("Arial", 200)
$textBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$stringFormat = New-Object System.Drawing.StringFormat
$stringFormat.Alignment = [System.Drawing.StringAlignment]::Center
$stringFormat.LineAlignment = [System.Drawing.StringAlignment]::Center
$g.DrawString("I", $font, $textBrush, 256, 256, $stringFormat)

$bmp.Save("public\icon.png", [System.Drawing.Imaging.ImageFormat]::Png)
