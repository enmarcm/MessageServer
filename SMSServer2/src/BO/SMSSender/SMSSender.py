import serial
import time
import logging

class SMSSender:
    def __init__(self, port, baudrate=9600):
        self.port = port
        self.baudrate = baudrate
        self.ser = None
        self.logger = logging.getLogger("SMSSender")
        logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

    def open_port(self):
        try:
            self.ser = serial.Serial(self.port, self.baudrate, timeout=5)
            self.logger.info(f"Port {self.port} opened successfully")
            time.sleep(2)
        except serial.SerialException as e:
            self.logger.error(f"Failed to open port {self.port}: {e}")
            raise

    def close_port(self):
        if self.ser and self.ser.is_open:
            self.ser.close()
            self.logger.info(f"Port {self.port} closed")

    def send_sms(self, to, message):
        try:
            self.open_port()
            self.logger.info("Sending AT commands to initialize modem")
            self.ser.write(b'AT\r')
            time.sleep(1)
            self.logger.info("Setting modem to text mode")
            self.ser.write(b'AT+CMGF=1\r')
            time.sleep(1)
            self.logger.info(f"Sending SMS to {to} with message: {message}")
            self.ser.write(f'AT+CMGS="{to}"\r'.encode())
            time.sleep(1)
            self.ser.write(f'{message}\x1A'.encode())
            time.sleep(3)
            response = self.ser.read_all().decode()
            self.logger.info(f"Response from modem: {response}")
            if "OK" in response:
                self.logger.info(f"SMS sent successfully to {to}")
                return True, ""
            else:
                self.logger.error(f"Failed to send SMS to {to}: {response}")
                return False, response
        except Exception as e:
            self.logger.error(f"Error while sending SMS: {e}")
            return False, str(e)
        finally:
            self.close_port()