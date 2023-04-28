import os
import csv
from django.core.management.base import BaseCommand
from django.conf import settings
from chessopeningtrainer.models import Opening

class Command(BaseCommand):
    help = 'Populates the database with opening data'

    def handle(self, *args, **options):
        opening_files = ['a.tsv', 'b.tsv', 'c.tsv', 'd.tsv', 'e.tsv']

        for file in opening_files:
            file_path = os.path.join(settings.BASE_DIR, 'chessopeningtrainer', 'openings', file)
            with open(file_path) as tsvfile:
                reader = csv.reader(tsvfile, delimiter='\t')
                for row in reader:
                    opening = Opening()
                    opening.eco = row[0]
                    opening.name = row[1]
                    opening.pgn = row[2]
                    opening.save()
        self.stdout.write(self.style.SUCCESS('Successfully populated database'))