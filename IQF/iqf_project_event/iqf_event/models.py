from django.db import models
import qrcode
from io import BytesIO
from django.core.files import File
from PIL import Image, ImageDraw
from django.utils.timezone import localtime
import random
from django.utils import timezone


default_value = timezone.now

class Registration(models.Model):
    full_name = models.CharField(max_length=100)  # Adicione este campo
    cpf = models.CharField(max_length=14)  # Adicione este campo
    email = models.EmailField()  # Adicione este campo
    phone = models.CharField(max_length=15)  # Adicione este campo
    qr_code = models.ImageField(upload_to='qr_codes', blank=True)
    data_inscricao = models.DateTimeField(auto_now_add=True)
    presence = models.CharField(max_length=10, default='Ausente')
    custom_id = models.IntegerField(unique=True, null=True, blank=True)  # Campo para o ID personalizado
    empresa = models.CharField(max_length =255, null=True , blank =True)
    cargo = models.CharField(max_length = 255,null=True , blank =True)

    def save(self, *args, **kwargs):
        # Gera o QR code
        if not self.custom_id:  # Se o custom_id ainda não foi definido
            while True:
                # Gerar um número aleatório de 6 dígitos
                random_id = random.randint(100000, 999999)
                # Verificar se o ID já existe
                if not Registration.objects.filter(custom_id=random_id).exists():
                    self.custom_id = random_id
                    break

        qrcode_img = qrcode.make(self.custom_id)
        canvas = Image.new('RGB', (290, 290), 'white')
        draw = ImageDraw.Draw(canvas)
        canvas.paste(qrcode_img)
        fname = f'qr_code-{self.full_name}.png'
        buffer = BytesIO()
        canvas.save(buffer, 'PNG')
        self.qr_code.save(fname, File(buffer), save=False)
        canvas.close()
        super().save(*args, **kwargs)
