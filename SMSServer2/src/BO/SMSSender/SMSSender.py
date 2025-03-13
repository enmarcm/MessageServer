import serial
import time

class SMSSender:
    def __init__(self, port, baudrate=9600):
        self.port = port
        self.baudrate = baudrate
        self.ser = serial.Serial(port, baudrate, timeout=5)
        time.sleep(2)  # Espera a que el módem se inicialice

    def send_sms(self, to, message):
        try:
            self.ser.write(b'AT\r')
            time.sleep(1)
            self.ser.write(b'AT+CMGF=1\r')  # Configura el módem en modo texto
            time.sleep(1)
            self.ser.write(f'AT+CMGS="{to}"\r'.encode())  # Número de teléfono del destinatario
            time.sleep(1)
            self.ser.write(f'{message}\x1A'.encode())  # Contenido del mensaje y Ctrl+Z para enviar
            time.sleep(3)
            response = self.ser.read_all().decode()
            if "OK" in response:
                return True, ""
            else:
                return False, response
        except Exception as e:
            return False, str(e)
        finally:
            self.ser.close()