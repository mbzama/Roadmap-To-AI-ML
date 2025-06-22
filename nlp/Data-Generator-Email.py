import pandas as pd
import random
import re
from datetime import datetime, timedelta

class EmailDataGenerator:
    def __init__(self):
        # Common spam keywords and phrases
        self.spam_keywords = [
            "URGENT", "WINNER", "CONGRATULATIONS", "FREE", "CASH", "MONEY",
            "MILLION", "LOTTERY", "PRIZE", "CLICK HERE", "LIMITED TIME",
            "ACT NOW", "GUARANTEED", "RISK FREE", "NO OBLIGATION",
            "AMAZING OFFER", "INCREDIBLE DEAL", "EXCLUSIVE", "SPECIAL PROMOTION"
        ]
        
        # Spam subject templates
        self.spam_subjects = [
            "🎉 CONGRATULATIONS! You've WON ${amount}!",
            "URGENT: Your account will be suspended",
            "FREE ${product} - Limited Time Only!",
            "Make ${amount} from home TODAY!",
            "WINNER: You've been selected for ${prize}",
            "CLICK HERE to claim your ${reward}",
            "AMAZING offer expires in {hours} hours!",
            "Your payment of ${amount} is pending",
            "EXCLUSIVE deal just for you!",
            "RISK FREE investment opportunity"
        ]
        
        # Spam body templates
        self.spam_bodies = [
            """Dear Lucky Winner,
            
CONGRATULATIONS! You have been selected as a WINNER in our international lottery program. 
You have won ${amount} USD! To claim your prize, please click the link below and provide 
your personal details.

CLICK HERE NOW: http://suspicious-lottery-site.com

This offer expires in 24 hours. ACT NOW!

Best regards,
International Lottery Commission""",

            """URGENT NOTICE:
            
Your bank account will be SUSPENDED unless you verify your details immediately.
Click here to verify: http://fake-bank-site.com

Failure to verify within 24 hours will result in permanent account closure.

WARNING: This is your FINAL notice!""",

            """Make ${amount} per day working from home!
            
NO experience required! NO investment needed!
GUARANTEED results or your money back!

Join thousands of satisfied customers who are already earning BIG MONEY.

Click here to start: http://work-from-home-scam.com

Limited spots available - ACT NOW!""",

            """FREE ${product} for the first 100 customers!
            
AMAZING OFFER - usually costs ${original_price}!
- FREE shipping worldwide
- NO hidden fees
- RISK FREE 30-day trial

Click here to claim yours: http://free-product-scam.com

Hurry! Only {remaining} spots left!""",

            """Investment Opportunity - GUARANTEED returns!
            
Make ${percentage}% profit in just {days} days!
Our trading bot uses AI to GUARANTEE profits.

RISK FREE - Your money is 100% safe!
Join {customers} satisfied investors.

Start now: http://investment-scam.com"""
        ]
        
        # Ham (legitimate) subject templates
        self.ham_subjects = [
            "Meeting reminder: {topic} on {date}",
            "Your order #{order_id} has been shipped",
            "Weekly team update",
            "Invoice #{invoice_id} from {company}",
            "Welcome to {service}",
            "Password reset request",
            "Project {project} deadline approaching",
            "Monthly newsletter - {month} {year}",
            "Thank you for your purchase",
            "Appointment confirmation"
        ]
        
        # Ham body templates
        self.ham_bodies = [
            """Hi {name},

Hope you're doing well. I wanted to remind you about our meeting scheduled for {date} at {time} to discuss {topic}.

The meeting will be held in {location}. Please let me know if you need to reschedule.

Best regards,
{sender}""",

            """Dear {name},

Your order #{order_id} has been processed and shipped. You can track your package using the tracking number: {tracking}.

Expected delivery date: {delivery_date}

If you have any questions, please don't hesitate to contact our customer service.

Best regards,
{company} Team""",

            """Team Update - {date}

Hi everyone,

Here's our weekly team update:

- Project A: On track, 75% complete
- Project B: Ahead of schedule, launching next week
- Team meeting: Friday at 2 PM

Please review the attached documents and let me know if you have any questions.

Thanks,
{manager}""",

            """Invoice #{invoice_id}

Dear {name},

Please find attached invoice #{invoice_id} for services rendered in {month}.

Amount due: ${amount}
Due date: {due_date}

Payment can be made via our online portal or by check.

Thank you for your business.

{company} Accounting""",

            """Welcome to {service}!

Hi {name},

Thank you for signing up for {service}. We're excited to have you on board!

Your account has been created with the username: {username}

To get started, please log in to your account and complete your profile.

If you need any assistance, our support team is here to help.

Welcome aboard!
The {service} Team"""
        ]
        
        # Sample data for templates
        self.sample_data = {
            'names': ['John', 'Sarah', 'Mike', 'Emily', 'David', 'Lisa', 'Chris', 'Anna', 'Tom', 'Maria'],
            'companies': ['TechCorp', 'DataSystems', 'CloudWorks', 'InnovateLab', 'DigitalSolutions'],
            'services': ['CloudSync', 'DataVault', 'SecureNet', 'SmartAnalytics', 'WebBuilder'],
            'topics': ['budget planning', 'project review', 'quarterly goals', 'team restructuring', 'product launch'],
            'locations': ['Conference Room A', 'Main Office', 'Zoom Meeting', 'Building 2, Floor 3', 'Client Office'],
            'products': ['iPhone', 'laptop', 'tablet', 'smartwatch', 'headphones', 'camera']
        }
    
    def generate_spam_email(self):
        """Generate a spam email"""
        subject_template = random.choice(self.spam_subjects)
        body_template = random.choice(self.spam_bodies)
        
        # Random values for templates
        amount = random.choice([1000, 5000, 10000, 50000, 100000, 1000000])
        product = random.choice(self.sample_data['products'])
        original_price = random.randint(100, 1000)
        hours = random.randint(12, 48)
        days = random.randint(7, 30)
        percentage = random.randint(50, 500)
        customers = random.randint(1000, 50000)
        remaining = random.randint(5, 50)
        prize = f"{amount} USD"
        reward = f"{amount} cash prize"
        
        # Format templates
        subject = subject_template.format(
            amount=amount, product=product, hours=hours, prize=prize, reward=reward
        )
        
        body = body_template.format(
            amount=amount, product=product, original_price=original_price,
            days=days, percentage=percentage, customers=customers, remaining=remaining
        )
        
        return subject, body
    
    def generate_ham_email(self):
        """Generate a legitimate (ham) email"""
        subject_template = random.choice(self.ham_subjects)
        body_template = random.choice(self.ham_bodies)
        
        # Random values for templates
        name = random.choice(self.sample_data['names'])
        company = random.choice(self.sample_data['companies'])
        service = random.choice(self.sample_data['services'])
        topic = random.choice(self.sample_data['topics'])
        location = random.choice(self.sample_data['locations'])
        
        # Generate dates
        base_date = datetime.now()
        meeting_date = base_date + timedelta(days=random.randint(1, 30))
        delivery_date = base_date + timedelta(days=random.randint(3, 10))
        due_date = base_date + timedelta(days=random.randint(15, 45))
        
        # Generate IDs
        order_id = f"ORD{random.randint(10000, 99999)}"
        invoice_id = f"INV{random.randint(1000, 9999)}"
        tracking = f"TR{random.randint(100000000, 999999999)}"
        username = f"{name.lower()}{random.randint(10, 99)}"
        
        # Format templates
        subject = subject_template.format(
            topic=topic,
            date=meeting_date.strftime("%B %d"),
            order_id=order_id,
            invoice_id=invoice_id,
            company=company,
            service=service,
            project=f"Project {random.choice(['Alpha', 'Beta', 'Gamma', 'Delta'])}",
            month=base_date.strftime("%B"),
            year=base_date.year
        )
        
        body = body_template.format(
            name=name,
            date=meeting_date.strftime("%B %d, %Y"),
            time=f"{random.randint(9, 17)}:00",
            topic=topic,
            location=location,
            sender=random.choice(self.sample_data['names']),
            order_id=order_id,
            tracking=tracking,
            delivery_date=delivery_date.strftime("%B %d, %Y"),
            company=company,
            manager=random.choice(self.sample_data['names']),
            invoice_id=invoice_id,
            month=base_date.strftime("%B"),
            amount=random.randint(500, 5000),
            due_date=due_date.strftime("%B %d, %Y"),
            service=service,
            username=username
        )
        
        return subject, body
    
    def generate_dataset(self, num_spam=500, num_ham=500):
        """Generate a balanced dataset of spam and ham emails"""
        emails = []
        
        # Generate spam emails
        print(f"Generating {num_spam} spam emails...")
        for i in range(num_spam):
            if i % 100 == 0:
                print(f"Generated {i} spam emails...")
            subject, body = self.generate_spam_email()
            emails.append({
                'subject': subject,
                'body': body,
                'label': 'spam'
            })
        
        # Generate ham emails
        print(f"Generating {num_ham} ham emails...")
        for i in range(num_ham):
            if i % 100 == 0:
                print(f"Generated {i} ham emails...")
            subject, body = self.generate_ham_email()
            emails.append({
                'subject': subject,
                'body': body,
                'label': 'ham'
            })
        
        # Shuffle the dataset
        random.shuffle(emails)
        
        return pd.DataFrame(emails)
    
    def save_to_csv(self, df, filename='email_spam_dataset.csv'):
        """Save the dataset to a CSV file"""
        df.to_csv(filename, index=False, encoding='utf-8')
        print(f"Dataset saved to {filename}")
        print(f"Total emails: {len(df)}")
        print(f"Spam emails: {len(df[df['label'] == 'spam'])}")
        print(f"Ham emails: {len(df[df['label'] == 'ham'])}")

def main():
    """Main function to generate and save email dataset"""
    print("Email Spam Classification Data Generator")
    print("=" * 40)
    
    # Create generator instance
    generator = EmailDataGenerator()
    
    # Generate dataset
    # You can adjust the numbers based on your needs
    df = generator.generate_dataset(num_spam=1000, num_ham=1000)
    
    # Save to CSV
    generator.save_to_csv(df, 'email_spam_dataset.csv')
    
    # Display sample data
    print("\nSample data:")
    print("-" * 20)
    print("\nSpam example:")
    spam_sample = df[df['label'] == 'spam'].iloc[0]
    print(f"Subject: {spam_sample['subject']}")
    print(f"Body: {spam_sample['body'][:200]}...")
    
    print("\nHam example:")
    ham_sample = df[df['label'] == 'ham'].iloc[0]
    print(f"Subject: {ham_sample['subject']}")
    print(f"Body: {ham_sample['body'][:200]}...")
    
    print("\nDataset generation complete!")

if __name__ == "__main__":
    main()