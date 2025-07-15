import React from "react";
import { Form, Row, Col, Card, Typography, theme } from "antd";
import { useTranslation } from "react-i18next";

const { Text } = Typography;

interface Text2SqlApplicationFormProps {
  form: any;
}

const Text2SqlApplicationForm: React.FC<Text2SqlApplicationFormProps> = ({
  form,
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();

  const cardStyle = {
    marginBottom: 16,
    borderRadius: 8,
    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.03)",
    border: `1px solid ${token.colorBorderSecondary}`,
  };

  const cardHeadStyle = {
    borderBottom: `1px solid ${token.colorBorderSecondary}`,
    padding: "12px 18px",
    fontWeight: 500,
  };

  const cardBodyStyle = {
    padding: "18px",
  };

  return (
    <div>
      <Card
        title={t("Text2SQL应用")}
        bordered={false}
        style={cardStyle}
        headStyle={cardHeadStyle}
        bodyStyle={cardBodyStyle}
      >
        <Row gutter={[24, 16]}>
          <Col span={24}>
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <Text type="secondary" style={{ fontSize: "16px" }}>
                {t("Text2SQL功能暂未实现，敬请期待...")}
              </Text>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default Text2SqlApplicationForm;
