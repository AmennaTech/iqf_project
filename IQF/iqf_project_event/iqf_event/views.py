from django.http import JsonResponse
from .models import Registration
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .serializers import RegistrationSerializer
from django.conf import settings
from django.core.files.storage import FileSystemStorage
from django.shortcuts import render
from django.shortcuts import get_object_or_404
from django.shortcuts import render
import os
from django.core.mail import EmailMessage
from django.template.loader import render_to_string

@api_view(['POST'])
def register(request):
    serializer = RegistrationSerializer(data=request.data)

    if serializer.is_valid():
        registration = serializer.save()
        
        # Construir a URL completa para o QR code
        qr_code_url = ''  # Initialize the variable outside the if block
        if registration.qr_code:  # Check if qr_code exists for the registration
            fs = FileSystemStorage(location=settings.MEDIA_ROOT)
            qr_code_url = request.build_absolute_uri(fs.url(registration.qr_code.name))
            qr_code_file_path = os.path.join(settings.MEDIA_ROOT, registration.qr_code.name) if registration.qr_code else None
        
        # Send the confirmation email
        send_registration_email(
            full_name=registration.full_name,
            email=registration.email,
            qr_code_file_path=qr_code_file_path  # Pass the file path, not the URL
        )
        
        # Retornar os dados do registro e a URL do QR code
        response_data = serializer.data
        response_data['qr_code_url'] = qr_code_url  # Now qr_code_url is defined
        return Response(response_data, status=201)
    else:
        return Response({
            'message': 'Requisição inválida',
            'errors': serializer.errors
        }, status=400)

def index(request):
    return render(request, 'index.html')

def registration(request):
    return render(request, 'registration.html')
    # ... outras views


from django.shortcuts import get_object_or_404

@api_view(['GET', 'POST'])
def confirm_presence(request):
    # Se for uma requisição GET, tente buscar os dados baseados no 'custom_id'
    if request.method == 'GET':
        custom_id = request.GET.get('custom_id')
        if custom_id:
            registration = get_object_or_404(Registration, custom_id=custom_id)
            serializer = RegistrationSerializer(registration)
            return Response(serializer.data)
        else:
            # Se não houver 'custom_id', simplesmente renderize o template HTML
            return render(request, 'confirm_presence.html')

    # Se for uma requisição POST, atualize o status de presença
    elif request.method == 'POST':
        custom_id = request.data.get('custom_id')
        registration = get_object_or_404(Registration, custom_id=custom_id)
        registration.presence = 'Presente'
        registration.save()
        return Response({
            'message': 'Presença confirmada',
            'full_name': registration.full_name,
            'cpf': registration.cpf,
            'email': registration.email
        })


def send_registration_email(full_name, email, qr_code_file_path):
    context = {
        'full_name': full_name,
    }
    email_subject = 'Evento IQF'
    email_body = render_to_string('email_template.html', context)

    email = EmailMessage(
        email_subject,
        email_body,
        settings.EMAIL_HOST_USER,
        [email],
    )
    email.content_subtype = 'html'  # Para poder usar HTML no corpo do e-mail

    # Anexar o QR Code como um arquivo
    if qr_code_file_path:
        with open(qr_code_file_path, 'rb') as qr_file:
            email.attach('qr_code.png', qr_file.read(), 'image/png')

    email.send()
